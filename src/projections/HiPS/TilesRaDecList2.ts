import { MinMaxValue } from "../MinMaxValue.js"
import { RADecMinMaxCentral } from "../RADecMinMaxCentral.js"
import { ImagePixel } from "./ImagePixel.js"

export class TilesRaDecList2 {
    
    // hipsOrder: number
    tileList: Array<number>
    imagePixelList: ImagePixel[]
    minPixelValue: number | null = null
    maxPixelValue: number | null = null

    
    // constructor(hipsOrder: number) {
    //     this.hipsOrder = hipsOrder
    constructor() {
        this.tileList = []
        this.imagePixelList = new Array<ImagePixel>()

    }

    findImagePixel(i: number, j: number) {
        return this.imagePixelList.find(p => p.i === i && p.j === j) || null;
    }

    getImagePixelsByTile(tileno: number): ImagePixel[] {
        return this.imagePixelList.filter(p => p.tileno === tileno);
    }

    getImagePixelList() {
        return this.imagePixelList
    }

    getTilesList() {
        return this.tileList
    }

    addImagePixel(imgpx: ImagePixel) {
        this.imagePixelList.push(imgpx)
    }

    addTileNumber(tileno: number) {
        if (!this.tileList.includes(tileno)) {
            this.tileList.push(tileno)
        }
    }


    computeRADecMinMaxCentral(): RADecMinMaxCentral | null {
        if (this.imagePixelList.length == 0) {
            return null
        }
        const minRA = this.imagePixelList[0].getRADeg()
        const minDec = this.imagePixelList[0].getDecDeg()

        const maxRA = this.imagePixelList[this.imagePixelList.length - 1].getRADeg()
        const maxDec = this.imagePixelList[this.imagePixelList.length - 1].getDecDeg()

        const cRA = (maxRA - minRA) / 2
        const cDec = (maxDec - minDec) / 2

        const raDecMinMaxCentral = new RADecMinMaxCentral(cRA, cDec, minRA, minDec, maxRA, maxDec)
        return raDecMinMaxCentral

    }

    setMinMaxValue(value: number | null) {
        if (!value) return

        if (!this.minPixelValue) {
            this.minPixelValue = value
        } else if (value < this.minPixelValue) {
            this.minPixelValue = value
        }
        
        if (!this.maxPixelValue) {
            this.maxPixelValue = value
        } else if (value > this.minPixelValue) {
            this.maxPixelValue = value
        }        
    }

    getMinMaxValues(){
        if (this.minPixelValue && this.maxPixelValue) {
            return new MinMaxValue(this.minPixelValue, this.maxPixelValue)
        }
        return null
        
    }

}
