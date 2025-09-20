import { ParseUtils } from "jsfitsio";
export class ImagePixel {
    constructor(a, b, tileno) {
        this.uint8value = null;
        this.value = null;
        this.tileno = tileno;
        // Heuristic: if `a` and `b` are integers, treat them as `i` and `j`
        if (Number.isInteger(a) && Number.isInteger(b)) {
            this.i = a;
            this.j = b;
            this.ra = NaN;
            this.dec = NaN;
        }
        else {
            this.ra = a;
            this.dec = b;
            this.i = -1;
            this.j = -1;
        }
    }
    geti() {
        return this.i;
    }
    getj() {
        return this.j;
    }
    getRADeg() {
        return this.ra;
    }
    getDecDeg() {
        return this.dec;
    }
    getUint8Value() {
        return this.uint8value;
    }
    getValue() {
        return this.value;
    }
    setValue(value, bitpix) {
        if (this.uint8value == undefined) {
            const bytesXelem = Math.abs(bitpix / 8);
            this.uint8value = new Uint8Array(bytesXelem);
        }
        this.uint8value = value;
        this.value = ParseUtils.extractPixelValue(0, value, bitpix);
    }
    setTileNumber(tileno) {
        this.tileno = tileno;
    }
    setij(i, j) {
        this.i = i;
        this.j = j;
    }
    setRADecDeg(ra, dec) {
        this.ra = ra;
        this.dec = dec;
    }
}
//# sourceMappingURL=ImagePixel.js.map