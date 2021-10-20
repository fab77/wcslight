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
    _outputImageMap;
    _image;
    /**
     * 
     * @param {*} center {"ra":,"dec"} in degrees
     * @param {*} radius decimal deg
     * @param {*} pxsize decimal deg
     * @param {*} projection from constant?
     */
    // TODO THIS IS A WCSLIGHT but I developed it as CUTOUT using WCS
    constructor(center, radius, pxsize, outProjectionName, inProjectionName) {
     
        try {
            this._outprojection = OutProjFactory.get(center, radius, pxsize, outProjectionName);
            this._outputImageMap = this._outprojection.generateOutputImageMap();
            
            this._image = undefined;
            
            this._inprojection = InProjFactory.get(pxsize, inProjectionName);
            if (this._inprojection instanceof InHiPSProjection) {
                // this._inprojection.generateTilesMap(this._outprojection.getOutputImage());
                this._inprojection.generateTilesMap(this._outputImageMap); // Image.js 
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
     fillOutputImage(inData, headerinfo, tileno = null) {

        if (this._image === undefined) {
            this._image = new Image(this._outprojection);
        }
        this._image.updateFITSHeader(headerinfo);
        


        // TODO ALL THIS BELOW should go into the HiPSprojection.world2pix(tileno, ra, dec). 
        // HiPSprojection should contains a list of HEALPixProjections, one per each 
        // tile and delegate to each of them the world2pix
        if (this._inprojection instanceof InHiPSProjection) {

            if (tileno === null) {
                throw new HPXTilesMapNotDefined();
            }
            
            this._inprojection.init(tileno);
            let tilesMap = this._inprojection.getTilesMap();

            tilesMap.get(tileno).forEach(imgpx => {
                let pxij = this._inprojection.world2pix(imgpx.ra, imgpx.dec);
                // imgpx contains i, j for the output projection, inData is organised with i, j from the input projection
                imgpx.value = inData[pxij.i, pxij.j];
                this._image.setPxValue(imgpx);
            });
        }
    }


  
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
        // TODO finalize FITS header by calling Image._projection.finalizeFITSHeader(min, max)
        this._outputImageMap.finalizeFITSHeader();
        return this._outputImageMap;
    }

}

export default WCSLight;