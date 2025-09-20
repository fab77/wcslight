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
        if (this.imagePixelList.length === 0) return null;

        // Single pass, skip non-finite values
        let minRA = Infinity, maxRA = -Infinity;
        let minDec = Infinity, maxDec = -Infinity;

        for (const p of this.imagePixelList) {
            if (Number.isFinite(p.ra)) {
                if (p.ra < minRA) minRA = p.ra;
                if (p.ra > maxRA) maxRA = p.ra;
            }
            if (Number.isFinite(p.dec)) {
                if (p.dec < minDec) minDec = p.dec;
                if (p.dec > maxDec) maxDec = p.dec;
            }
        }

        // If all values were non-finite, bail out
        if (!Number.isFinite(minRA) || !Number.isFinite(maxRA) ||
            !Number.isFinite(minDec) || !Number.isFinite(maxDec)) {
            return null;
        }

        const cRA = minRA + (maxRA - minRA) / 2;
        const cDec = minDec + (maxDec - minDec) / 2;

        return new RADecMinMaxCentral(cRA, cDec, minRA, minDec, maxRA, maxDec);
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

    getMinMaxValues() {
        if (this.minPixelValue && this.maxPixelValue) {
            return new MinMaxValue(this.minPixelValue, this.maxPixelValue)
        }
        return null

    }

}
