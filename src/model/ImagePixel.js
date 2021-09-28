"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

class ImagePixel {
    _ra;    // decimal degrees
    _dec;   // decimal degrees
    _i;     // int
    _j;     // int
    _tileno;// int
    _value;

    /**
     * 
     * @param {*} ra world coordinate
     * @param {*} dec world coordinate
     * @param {*} i pixel coordinate in FITS
     * @param {*} j pixel coordinate in FITS
     */
    constructor (ra, dec, i = null, j = null, tileno = null) {
        this._ra = ra;
        this._dec = dec;
        this._i = i;
        this._j = j;
        this._tileno = tileno;

    }

    /**
     * @param {any} val
     */
    set value(val) {
        this._value = val;
    }

    getRA() {
        return this._ra;
    }

    getDec() {
        return this._dec;
    }

    geti() {
        return this._i;
    }

    getj() {
        return this._j;
    }

    getTileno() {
        return this._tileno
    }
}
export default ImagePixel;