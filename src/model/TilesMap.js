"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

class TilesMap {

    _nside;
    _norder;
    _tilesMap;

    constructor(nside) {
        this._nside = nside;
        this._norder = Math.log2 (nside);
        this._tilesMap = new Map();
    }

    getTilesMap () {
        return this._tilesMap;
    }

    getNorder () {
        return this._norder;
    }

    pushImgPx2Tile(tileno, imgpx) {
        if (!this._tilesMap.has(tileno)){
            this._tilesMap.set(tileno, []);
        }
        this._tilesMap.get(tileno).push(imgpx);
    }

    // getImgpixels(tileno) {
    //     return this._tilesMap.get(tileno);
    // }


}

export default TilesMap;