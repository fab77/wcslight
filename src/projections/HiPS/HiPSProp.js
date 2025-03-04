"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HiPSProp = void 0;
var HiPSProp = /** @class */ (function () {
    function HiPSProp() {
        this.itemMap = new Map();
    }
    HiPSProp.prototype.addItem = function (key, value) {
        this.itemMap.set(key, value);
    };
    HiPSProp.prototype.getItem = function (key) {
        return this.itemMap.get(key);
    };
    HiPSProp.prototype.isGalactic = function () {
        return this.itemMap.get(HiPSProp.FRAME) == HiPSProp.GALACTIC;
    };
    HiPSProp.TILE_WIDTH = "TILE_WIDTH";
    HiPSProp.FRAME = "FRAME";
    HiPSProp.ORDER = "ORDER";
    HiPSProp.GALACTIC = "galactic";
    return HiPSProp;
}());
exports.HiPSProp = HiPSProp;
