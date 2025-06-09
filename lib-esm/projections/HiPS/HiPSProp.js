export class HiPSProp {
    constructor() {
        // static NAXIS:string = "NAXIS"
        // static NAXIS1:string = "NAXIS1"
        // static NAXIS2:string = "NAXIS2"
        // static BITPIX:string = "BITPIX"
        // static BSCALE:string = "BSCALE"
        // static BZERO:string = "BZERO"
        // static SIMPLE:string = "SIMPLE"
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