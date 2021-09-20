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

class WCSLight {

    _projection;
    _center;
    _radius;

    /**
     * 
     * @param {*} center {"ra":,"dec"} in degrees
     * @param {*} radius decimal deg
     * @param {*} pxsize decimal deg
     * @param {*} projection from constant?
     */
    constructor(center, radius, pxsize, projectionName) {
        this._projection = ProjFactory.get(center, radius, pxsize, projectionName);
        this._center = center;
        this._radius = radius;
        this._pxsize = pxsize;
    }

    /**
     * @return an empty array representing the output image/FITS. 
     * It will be filled with pixels values in another method.
     */
    getImageMap () {
        //the projection must compute row=NAXIS1 and cols=NAXIS2 of the output empty image)
        // Entries in map below contain {ra, dec, value(empty)} for each pixel
        let map = this._projection.generatePxMatrix();
    }






}

export default WCSLight;