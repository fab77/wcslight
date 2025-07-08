export class RADecList {
    constructor() {
        this.imagePixelList = new Array();
    }
    findImagePixel(i, j) {
        return this.imagePixelList.find(p => p.i === i && p.j === j) || null;
    }
    getImagePixelList() {
        return this.imagePixelList;
    }
    addImagePixel(imgpx) {
        this.imagePixelList.push(imgpx);
    }
}
//# sourceMappingURL=RADecList.js.map