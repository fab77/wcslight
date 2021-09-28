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
            this._outprojection.generatePxMatrix();

            this._inprojection = ProjFactory.get(center, radius, pxsize, inProjectionName);
            if (this._inprojection instanceof HiPSProjection) {
                this._tilesMap = this._inprojection.generateTilesMap(this._outprojection.getOutputImage());
                // the program calling WCSLight must iterate over tilesMap and:
                //  - retrieve the FITS file and extract the data (pixels values)
                //  - call WCS fillOutputImage(data, tilesMap[n]) which fills the values in the output for the given input tile
            }
        } catch (e) {
            console.error(e.getError());
            exit(-1);
        }

    }

    /**
     * 
     * @param {matrix} inData Array of array Naxis1 x Naxis2 of data 
     * @param {int} tileno in case of HiPS or HEALPix, tile number
     */
     fillOutputImage(inData, inHeader, tileno) {

        
        if (this._inprojection instanceof HiPSProjection) {

            // TODO inData[0].length, inData.length are not needed in this case
            this._inprojection.init(nside, tileno, inHeader.naxis1, inHeader.naxis2);
            this._tilesMap[tileno].forEach(imgpx => {
                let pxij = this._inprojection.world2pix(imgpx.ra, imgpx.dec);
                let pxval = this._inprojection.getValue(pxij.i, pxij.j, inData);    // <-- TODO to be implemented!!! Take it from FITSOnTheWeb
                imgpx.value = pxval;
                this._outprojection.setPxValue(imgpx);
            });
            
        }
        
    }

  
    /**
     * It should be called only when HEALPix is used as input projection. 
     */
    getHiPSTilesMap () {
        if (this._tilesMap === undefined) {
            throw new HPXTilesMapNotDefined();
        }
        return this._tilesMap;
    }

}

export default WCSLight;