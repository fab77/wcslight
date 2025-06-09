export class FITSProp {
    constructor() {
        // static SIMPLE:string = "SIMPLE"
        this.itemMap = new Map();
    }
    addItem(key, value) {
        this.itemMap.set(key, value);
    }
    getItem(key) {
        return this.itemMap.get(key);
    }
}
// static TILE_WIDTH:string = "TILE_WIDTH"
// static ORDER:string = "ORDER"
FITSProp.NPIX = "NPIX";
//# sourceMappingURL=FITSProp.js.map