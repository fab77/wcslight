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
import ImagePixel from '../model/ImagePixel';

class MercatorProjection extends AbstractProjection {

    _minra;
    _mindec;
    
    _naxis1;
    _naxis2;
    
    _pxsize;

    _pxmatrix;

    _fitsheader;

    /**
     * 
     * @param {*} center {ra, dec} in decimal degrees
     * @param {*} radius decimal degrees
     * @param {*} pxsize decimal degrees
     */
    constructor (center, radius, pxsize) {
        super();
        this.computeSquaredNaxes (2 * radius, pxsize);
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

    computeSquaredNaxes (d, ps) {
        // first aprroximation to be checked
        this._naxis1 =  Math.ceil(d / ps);
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


    /**
     * @return an empty array of (ImagePixel.js} representing the output image/FITS. 
     * It will be filled with pixels values in another method.
     */
    generatePxMatrix () {
        this._pxmatrix = [];

        for (let j = 0; j < this._naxis2; j++) { // rows

            let row = new Array(this._naxis1);

            for (let i =  0; i < this._naxis1; i++) { // cols
            
                if (this._minra + this._pxsize > 360) {
                    this._minra -= 360;
                }
                // TODO handle Dec > 90 (or <-90 probably not possible): skip that pixel?

                let ii = new ImagePixel (this._minra + this._pxsize * j, this._mindec + this._pxsize * i, i, j);
                row[j] = ii;
            }

            this._pxmatrix.push(row); // row based

        }
    }

    /**
     * 
     * @param {ImagePixel} imgpx 
     */
    setPxValue (imgpx) {
        this._pxmatrix[imgpx.i][imgpx.j] = imgpx;
    }

    getPxMatrix() {
        return this._pxmatrix;
    }
}

export default MercatorProjection;