"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

class HPXTilesMapNotDefined {

    _error;

    constructor(projection)  {
        this._error = "HEALPix tiles map not defined. Check if HEALPix is used as input projection.";
    }

    getError() {
        return this._error;
    }

}

export default HPXTilesMapNotDefined;