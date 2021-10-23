"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

import RGBA from "./RGBA";

class ImagePixel {
    _ra;    // decimal degrees
    _dec;   // decimal degrees
    _i;     // int i of input projection
    _j;     // int j of input projection
    _tileno;// int
    // _originalValue;
    _value;
    _rgba;

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
        // this._originalValue = unndefined;
        this._rgba = new RGBA();
    }

    setRGBA(r, g, b, a) {
        this._rgba.set(r, g, b, a);
    }

    /**
     * @param {any} val
     */
    set value(val) {
        this._value = val;
        // if (this._originalValue === undefined) {
        //     this._originalValue = val;
        // }
    }

    getValue () {
        return this._value;
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