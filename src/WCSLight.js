"use strict";
import HEALPixProjection from "./projections/HEALPixProjection";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

import ProjFactory from "./projections/ProjFactory";

class WCSLight {

    _inprojection;
    _outprojection;
    _pxmap;

    /**
     * 
     * @param {*} center {"ra":,"dec"} in degrees
     * @param {*} radius decimal deg
     * @param {*} pxsize decimal deg
     * @param {*} projection from constant?
     */
    constructor(center, radius, pxsize, outProjectionName, inProjectionName) {
        try {
            this._outprojection = ProjFactory.get(center, radius, pxsize, outProjectionName);
            this._inprojection = ProjFactory.get(center, radius, pxsize, inProjectionName);
            this._outprojection.generatePxMatrix();
            if (this._inprojection instanceof HEALPixProjection) {
                let tilesMap = this._inprojection.generateTilesMap(this._outprojection.getPxMap());
                // the program calling WCSLight must iterate over tilesMap and:
                //  - retrieve the FITS file and extract the data (pixels values)
                //  - call WCS process(data, tilesMap[n]) which fills the values in the output for the given input tile
            }
        } catch (e) {
            console.error(e.getError());
            exit(-1);
        }

    }

    /**
     * @return an empty array representing the output image/FITS. 
     * It will be filled with pixels values in another method.
     */
    getImageMap () {
        //the projection must compute row=NAXIS1 and cols=NAXIS2 for the output empty image)
        // Entries in map below contain {ra, dec, value(empty)} for each pixel
        this._pxmap = this._projection.generatePxMatrix();
    }

    computeValues (inProjectionName, data) {
        
        // this._inprojection.
    }

    

}

export default WCSLight;