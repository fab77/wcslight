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
HiPSProp.TILE_WIDTH = "hips_tile_width";
HiPSProp.FRAME = "hips_frame";
HiPSProp.ORDER = "hips_order";
HiPSProp.GALACTIC = "galactic";
HiPSProp.SCALE = "hips_pixel_scale";
HiPSProp.BITPIX = "hips_pixel_bitpix";
//# sourceMappingURL=HiPSProp.js.map