export class HiPSProperties {
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
        return this.itemMap.get(HiPSProperties.FRAME) == HiPSProperties.GALACTIC;
    }
}
HiPSProperties.TILE_WIDTH = "hips_tile_width";
HiPSProperties.FRAME = "hips_frame";
HiPSProperties.ORDER = "hips_order";
HiPSProperties.GALACTIC = "galactic";
HiPSProperties.SCALE = "hips_pixel_scale";
HiPSProperties.BITPIX = "hips_pixel_bitpix";
//# sourceMappingURL=HiPSProperties.js.map