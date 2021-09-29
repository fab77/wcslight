"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

import InProjFactory from "./projections/InProjFactory";
import OutProjFactory from "./projections/OutProjFactory";
import InHiPSProjection from "./projections/InHiPSProjection";
import HPXTilesMapNotDefined from "./exceptions/HPXTilesMapNotDefined";

class WCSLight {

    _inprojection;
    _outprojection;
    _outputImage;
    /**
     * 
     * @param {*} center {"ra":,"dec"} in degrees
     * @param {*} radius decimal deg
     * @param {*} pxsize decimal deg
     * @param {*} projection from constant?
     */
    constructor(center, radius, pxsize, outProjectionName, inProjectionName) {
    
        try {
            this._outprojection = OutProjFactory.get(center, radius, pxsize, outProjectionName);
            this._outputImage = this._outprojection.generateOutputImage();

            this._inprojection = InProjFactory.get(pxsize, inProjectionName);
            if (this._inprojection instanceof InHiPSProjection) {
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
     * @param {pvmin} pvmin minimum px physical value
     * @param {pvmax} pvmax maximum px physical value
     * @param {int} tileno in case of HiPS or HEALPix, tile number, null otherwise
     */
     fillOutputImage(inData, pvmin, pvmax, tileno = null) {

        this._outputImage.setMinMAx(pvmin, pvmax);
        
        
        if (this._inprojection instanceof InHiPSProjection) {

            if (tileno === null) {
                throw new HPXTilesMapNotDefined();
            }
            
            this._inprojection.init(tileno);
            let tilesMap = this._inprojection.getTilesMap();

            tilesMap.get(tileno).forEach(imgpx => {
                let pxij = this._inprojection.world2pix(imgpx.ra, imgpx.dec);
                // let pxval = this._inprojection.getValue(pxij.i, pxij.j, inData);    // <-- TODO to be implemented!!! Take it from FITSOnTheWeb
                // imgpx.value = pxval;
                imgpx.value = inData[pxij.i, pxij.j];
                this._outputImage.setPxValue(imgpx);
            });
            
        }
    }

    // TODO handle here colorMAp, transferFunction, inverse, min-max

  
    /**
     * It should be called only when HEALPix is used as input projection. 
     */
    getHiPSTilesMap () {
        return this._inprojection.getTilesMap();
        // if (this._tilesMap === undefined) {
        //     throw new HPXTilesMapNotDefined();
        // }
        // return this._tilesMap;
    }

    getOutputImage() {
        return this._outputImage;
    }

}

export default WCSLight;