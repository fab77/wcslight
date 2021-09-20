"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

class ImageItem {
    _ra;    // decimal degrees
    _dec;   // decimal degrees
    _value;

    constructor (ra, dec) {
        this._ra = ra;
        this._dec = dec;
    }

    /**
     * @param {any} val
     */
    set value(val) {
        this._value = val;
    }
}
export default ImageItem;