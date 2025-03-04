export class FITSProp {
    constructor() {
        this.itemMap = new Map();
    }
    addItem(key, value) {
        this.itemMap.set(key, value);
    }
    getItem(key) {
        return this.itemMap.get(key);
    }
}
FITSProp.TILE_WIDTH = "TILE_WIDTH";
FITSProp.ORDER = "ORDER";
FITSProp.NPIX = "NPIX";
//# sourceMappingURL=FITSProp.js.map