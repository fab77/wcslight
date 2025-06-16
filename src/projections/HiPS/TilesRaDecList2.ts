import { ImagePixel } from "./ImagePixel.js"

export class TilesRaDecList2 {

    // hipsOrder: number
    tileList: Array<number>
    imagePixelList: ImagePixel[]

    
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
}
