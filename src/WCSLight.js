"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

import ProjFactory from "./projections/ProjFactory";
import HEALPixProjection from "./projections/HEALPixProjection";

import HPXTilesMapNotDefined from "./exceptions/HPXTilesMapNotDefined";

class WCSLight {

    _inprojection;
    _outprojection;
    // used only when HEALPix is the input projection. Map of (RA, Dec, outp_i, outp_j) points organised per tile.
    _tilesMap; 

    /**
     * 
     * @param {*} center {"ra":,"dec"} in degrees
     * @param {*} radius decimal deg
     * @param {*} pxsize decimal deg
     * @param {*} projection from constant?
     */
    constructor(center, radius, pxsize, outProjectionName, inProjectionName) {
        this._tilesMap = undefined;
        try {
            this._outprojection = ProjFactory.get(center, radius, pxsize, outProjectionName);
            this._inprojection = ProjFactory.get(center, radius, pxsize, inProjectionName);
            this._outprojection.generatePxMatrix();
            if (this._inprojection instanceof HEALPixProjection) {
                this._tilesMap = this._inprojection.generateTilesMap(this._outprojection.getPxMap());
                // the program calling WCSLight must iterate over tilesMap and:
                //  - retrieve the FITS file and extract the data (pixels values)
                //  - call WCS process(data, tilesMap[n]) which fills the values in the output for the given input tile
            }
        } catch (e) {
            console.error(e.getError());
            exit(-1);
        }

    }

    processData(inData, tileno) {

        if (isNumber(tileno)){ // HEALPix in projection
        // foreach ImageItem ii in this._tilesMap[tileno]:
            //  - pxval = this._inprojection.world2pix(ii.ra, ii.dec)
            //  - this._outprojection._pxmap[ii.i][ii.j] = pxval
            this._tilesMap[tileno].forEach(imgpx => {
                let pxij = this._inprojection.world2pix(imgpx.ra, imgpx.dec);
                let pxval = this._inprojection.getValue(pxij.i, pxij.j);    // <-- TODO to be implemented!!!
                this._outprojection._pxmap[imgpx.i][imgpx.j] = pxval
            });
        }
        
    }

    /**
     * It should be called only when HEALPix is used as input projection. 
     */
    getHEALPixTilesMap () {
        if (this._tilesMap === undefined) {
            throw new HPXTilesMapNotDefined();
        }
        return this._tilesMap;
    }

}

export default WCSLight;