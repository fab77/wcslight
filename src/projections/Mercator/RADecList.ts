import { ImagePixel } from "./ImagePixel.js"

export class RADecList {

    imagePixelList: ImagePixel[]
    
    constructor() {
        this.imagePixelList = new Array<ImagePixel>()
    }

    findImagePixel(i: number, j: number) {
        return this.imagePixelList.find(p => p.i === i && p.j === j) || null;
    }

    getImagePixelList() {
        return this.imagePixelList
    }

    addImagePixel(imgpx: ImagePixel){
        this.imagePixelList.push(imgpx)
    }
  }
  