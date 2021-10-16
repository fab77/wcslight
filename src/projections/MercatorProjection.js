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

        this.prepareFITSHeader(center.raDeg, center.decDeg, this._pxsize);
        
    }

    prepareFITSHeader (refRA, refDec, pxsize) {
        
        let str = this.formatHeaderLine("SIMPLE", "T");
        // TODO
        str += this.formatHeaderLine("BITPIX", headerDetails.bitpix); // to be taken from the input data
        
        str += this.formatHeaderLine("NAXIS", 2);
        str += this.formatHeaderLine("NAXIS1", this._naxis1);
        str += this.formatHeaderLine("NAXIS2", this._naxis2);
        // TODO
        str += this.formatHeaderLine("BLANK", headerDetails.blank); // to be taken from the input data and use it into Image in place of "NaN"
        str += this.formatHeaderLine("BSCALE", headerDetails.bscale); // to be taken from the input data
        str += this.formatHeaderLine("BZERO", headerDetails.bzero); // to be taken from the input data
        str += this.formatHeaderLine("CTYPE1", "RA---MER"); // TODO to be checked with the documentation
        str += this.formatHeaderLine("CTYPE2", "DEC--MER"); // TODO to be checked with the documentation
        
        str += this.formatHeaderLine("CDELT1", pxsize); // ??? Pixel spacing along axis 1 ???
        str += this.formatHeaderLine("CDELT2", pxsize); // ??? Pixel spacing along axis 2 ???
        str += this.formatHeaderLine("CRPIX1", this._naxis1/2); // central/reference pixel i along naxis1
        str += this.formatHeaderLine("CRPIX2", this._naxis2/2); // central/reference pixel j along naxis2
        str += this.formatHeaderLine("CRVAL1", refRA); // central/reference pixel RA
        str += this.formatHeaderLine("CRVAL2", refDec); // central/reference pixel Dec

        str += this.formatHeaderLine("DATAMAX", null); // take it from computed image
        str += this.formatHeaderLine("DATAMIN", null); // take it from computed image


        str += this.formatHeaderLine("WCSNAME", "Mercator");
        str += this.formatHeaderLine("ORIGIN", "FITSOnTheWeb v.0.x");
        str += this.formatHeaderLine("COMMENT", "FITSOnTheWebv0.x developed by F.Giordano and Y.Ascasibar");
        str += this.formatHeaderLine("END", "");

        this._fitsheader = str;
    }

    formatHeaderLine (keyword, value) {
        
        // SIMPLE must be the first keyword in the primary HDU
        // BITPIX must be the second keyword in the primary HDU
        // all rows 80 ASCII chars of 1 byte
        // bytes [0-8]   -> keyword
        // bytes [9-10] -> '= '
        // bytes [11-80] -> value:
        //      in case of number -> right justified to the 30th??? digit/position
        //      in case of string -> between '' and starting from byte 12
        let klen = keyword.length;
        let vlen;
        // keyword
        if (isNaN(value)){
            if (keyword == 'SIMPLE')  {
                value = value;
            }else{
                value = "'"+value+"'";
            }
            vlen = value.length;
        }else{
            vlen = value.toString().length;
        }
        
        let str = keyword;
        for (let i = 0; i < 8 - klen; i++) {
            str += ' ';
        }

        if (keyword !== 'END')  {
            // value
            str += "= ";
            str += value;
            for (let j = 80; j > 10 + vlen; j--) {
                str += ' ';
            }
        }
        
        return str;
    }

    setFITSHeaderMin (min) {
        str += this.formatHeaderLine("DATAMIN", min);
    }

    setFITSHeaderMax (max) {
        str += this.formatHeaderLine("DATAMAX", max);
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
    world2pix (radeg, decdeg) {
        // TODO Math.floor or Math.round?
        let i = Math.floor((radeg - this._minra) / this._pxsize);
        let j = Math.floor((decdeg - this._mindec) / this._pxsize);
        return [i, j];
    }


    /**
     * @return an empty array of (ImagePixel.js} representing the output image/FITS. 
     * It will be filled with pixels values in another method.
     */
    generateOutputImage () {
        let pxmatrix = [[]]; // Array of array of ImagePixel
        let i, j;
        for (let cra = this._minra; cra < (this._pxsize * this._naxis1); cra += this._pxsize) {
            let row = new Array(this._naxis1);
            for (let cdec = this._mindec; cdec < (this._pxsize * this._naxis2); cdec += this._pxsize) {
                [i, j] = this.world2pix(cra, cdec);
                let ip = new ImagePixel (cra, cdec, i, j);
                row[i] = ip;
            }
            pxmatrix.push(row); // row based
        }


        // for (let j = 0; j < this._naxis2; j++) { // rows

        //     let row = new Array(this._naxis1);

        //     for (let i =  0; i < this._naxis1; i++) { // cols
            
        //         if (this._minra + this._pxsize > 360) {
        //             this._minra -= 360;
        //         }

        //         let ii = new ImagePixel (this._minra + this._pxsize * i, this._mindec + this._pxsize * j, i, j);
        //         row[i] = ii;
        //     }

        //     pxmatrix.push(row); // row based

        // }

        let emptyImage = new Image(pxmatrix);
        return emptyImage;

    }

    // /**
    //  * 
    //  * @param {ImagePixel} imgpx 
    //  */
    // setPxValue (imgpx) {
    //     this._pxmatrix[imgpx.i][imgpx.j] = imgpx;
    // }

    // getOutputImage() {
    //     return this._pxmatrix;
    // }
}

export default MercatorProjection;