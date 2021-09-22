"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */


import AbstractProjection from './AbstractProjection';
// import ParseUtils from '../ParseUtils';
import ImageItem from '../model/ImageItem';

class MercatorProjection extends AbstractProjection {

    _minra;
    _mindec;
    
    _naxis1;
    _naxis2;
    
    _pxsize;

    _pxmap;

    _fitsheader;

    /**
     * 
     * @param {*} center {ra, dec} in decimal degrees
     * @param {*} radius decimal degrees
     * @param {*} pxsize decimal degrees
     */
    constructor (center, radius, pxsize) {
        super();
        this.computeSquare (2 * radius, pxsize);
        this._minra = center.raDeg - radius;
        if (this._minra < 0) {
            this._minra += 360;
        }
        this._mindec = center.decDeg - radius;
        this._pxsize = pxsize;

        this.prepareFITSHeader();
        
    }

    prepareFITSHeader () {
        // TODO
        this._fitsheader = "";
    }

    computeSquare (d, ps) {
        this._naxis1 =  d / ps;
        this._naxis2 = this._naxis1;
    }

    /** TODO !!! check and handle RA passing through 360-0 */
    pix2world (i, j) {

        let ra, dec;
        ra = i * this._stepra + this._minra;
        dec = j * this._stepdec + this._mindec;
        return [ra, dec];

    }

    /**
     * 
     * @param {*} radeg 
     * @param {*} decdeg
     *  
     */
    world2pix (radeg, decdeg) {}


    generatePxMatrix () {
        this._pxmap = [];
        for (let i =  0; i < this._naxis2; i++) { // cols

            let row = new Array(this._naxis1);
            
            for (let  j = 0; j < this._naxis1; j++) { // rows
                if (this._minra > 360) {
                    this._minra -= 360;
                }
                let ii = new ImageItem (this._minra + this._pxsize * j, this._mindec + this._pxsize * i);
                row[j] = ii;
            }

            this._pxmap.push(row); // row based

        }
    }

    getPxMap() {
        return this._pxmap;
    }
}

export default MercatorProjection;