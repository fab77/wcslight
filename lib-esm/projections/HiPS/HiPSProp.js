export class HiPSProp {
    constructor() {
        this.itemMap = new Map();
    }
    addItem(key, value) {
        this.itemMap.set(key, value);
    }
    getItem(key) {
        return this.itemMap.get(key);
    }
    isGalactic() {
        return this.itemMap.get(HiPSProp.FRAME) == HiPSProp.GALACTIC;
    }
}
HiPSProp.TILE_WIDTH = "TILE_WIDTH";
HiPSProp.FRAME = "FRAME";
HiPSProp.ORDER = "ORDER";
HiPSProp.GALACTIC = "galactic";
//# sourceMappingURL=HiPSProp.js.map