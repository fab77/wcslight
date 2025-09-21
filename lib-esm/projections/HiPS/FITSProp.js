export class FITSProp {
    // static TILE_WIDTH:string = "TILE_WIDTH"
    // static ORDER:string = "ORDER"
    static NPIX = "NPIX";
    // static SIMPLE:string = "SIMPLE"
    itemMap = new Map();
    constructor() { }
    addItem(key, value) {
        this.itemMap.set(key, value);
    }
    getItem(key) {
        return this.itemMap.get(key);
    }
}
//# sourceMappingURL=FITSProp.js.map