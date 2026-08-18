import { ParseUtils } from "jsfitsio"

export class ImagePixel {
    i: number
    j: number
    ra: number
    dec: number
    tileno: number | undefined
    uint8value: Uint8Array | null = null
    value: number | null = null

    constructor(i: number, j: number, tileno: number | undefined);

    constructor(ra: number, dec: number, tileno: number | undefined);

    constructor(a: number, b: number, tileno: number | undefined) {
        
        this.tileno = tileno;

        // Heuristic: if `a` and `b` are integers, treat them as `i` and `j`
        if (Number.isInteger(a) && Number.isInteger(b)) {
            this.i = a;
            this.j = b;
            this.ra = NaN;
            this.dec = NaN;
        } else {
            this.ra = a;
            this.dec = b;
            this.i = -1;
            this.j = -1;
        }
        
    }

    geti(){
        return this.i
    }

    getj(){
        return this.j
    }
    getRADeg(){
        return this.ra
    }

    getDecDeg(){
        return this.dec
    }

    getUint8Value(){
        return this.uint8value
    }

    getValue() {
        return this.value
    }

    setValue(value: Uint8Array, bitpix: number){
        if (this.uint8value == undefined) {
            const bytesXelem = Math.abs(bitpix / 8);
            this.uint8value = new Uint8Array(bytesXelem)
        }
        this.uint8value = value
        this.value = ParseUtils.extractPixelValue(0, value, bitpix)
    }

    setTileNumber(tileno: number) {
        this.tileno = tileno
    }

    setij(i:number, j:number){
        this.i = i
        this.j = j
    }

    setRADecDeg(ra:number, dec:number){
        this.ra = ra
        this.dec = dec
    }

}
