export class HiPSProperties {
    static TILE_WIDTH = "hips_tile_width";
    static FRAME = "hips_frame";
    static ORDER = "hips_order";
    static GALACTIC = "galactic";
    static SCALE = "hips_pixel_scale";
    static BITPIX = "hips_pixel_bitpix";
    itemMap = new Map();
    constructor() { }
    addItem(key, value) {
        this.itemMap.set(key, value);
    }
    getItem(key) {
        return this.itemMap.get(key);
    }
    isGalactic() {
        return this.itemMap.get(HiPSProperties.FRAME) == HiPSProperties.GALACTIC;
    }
}
//# sourceMappingURL=HiPSProperties.js.map