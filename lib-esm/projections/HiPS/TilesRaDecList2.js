export class TilesRaDecList2 {
    // constructor(hipsOrder: number) {
    //     this.hipsOrder = hipsOrder
    constructor() {
        this.tileList = [];
        this.imagePixelList = new Array();
    }
    findImagePixel(i, j) {
        return this.imagePixelList.find(p => p.i === i && p.j === j) || null;
    }
    getImagePixelsByTile(tileno) {
        return this.imagePixelList.filter(p => p.tileno === tileno);
    }
    getImagePixelList() {
        return this.imagePixelList;
    }
    getTilesList() {
        return this.tileList;
    }
    addImagePixel(imgpx) {
        this.imagePixelList.push(imgpx);
    }
    addTileNumber(tileno) {
        if (!this.tileList.includes(tileno)) {
            this.tileList.push(tileno);
        }
    }
}
//# sourceMappingURL=TilesRaDecList2.js.map