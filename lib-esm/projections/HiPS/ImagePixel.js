export class ImagePixel {
    constructor(a, b, tileno) {
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
        this.value = undefined;
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
    getValue() {
        return this.value;
    }
    setValue(value, bitpix) {
        if (this.value == undefined) {
            const bytesXelem = Math.abs(bitpix / 8);
            this.value = new Uint8Array(bytesXelem);
        }
        this.value = value;
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