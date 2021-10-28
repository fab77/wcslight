"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

//  import ColorMaps from './ColorMaps';
 import Canvas2D from './Canvas2D.js';
import AbstractProjection from '../projections/AbstractProjection.js';

class Image {

    _naxis1;
    _naxis2;
    _canvas2d;
    _projection;
    _headerDetails;
    /**
     * 
     * @param {AbstractProjection} projection output projection
     */
    constructor(projection) {

        this._pvmin = undefined;
        this._pvmax = undefined;
        this._projection = projection;

        // outputImageMap always accessible from this._projection.pxmatrix

        this._headerDetails = {
            "pvmin" : undefined,
            "pvmax" : undefined,
            "blank" : undefined,
            "bscale" : undefined,
            "bzero" : undefined,
            "bitpix" : undefined,
            "naxis1" : this._projection._naxis1,
            "naxis2" : this._projection._naxis2
        };

        this._pixelsValues = new Array(this._headerDetails.naxis2);
       
    }

    

    /**
     * 
     * @param {ImagePixel} imgpx 
     */
    setPxValue (imgpx) {

        // TODO check if Array can be used or, basing to BITPIX, a different array type (UInt8) must be used
        if (this._pixelsValues[imgpx.j] === undefined) {
            this._pixelsValues[imgpx.j] = new Array(this._headerDetails.naxis1);
        }

        if (imgpx.getValue() === this._headerDetails.blank){ // do I really need that?
            this._pixelsValues[imgpx.j][imgpx.i] = this._headerDetails.blank;
        } else {
            this._pixelsValues = imgpx.getValue();
        }
        
    }

    updateFITSHeader(headerinfo) {
        
        
        if (this._headerDetails.pvmin === undefined || this._headerDetails.pvmin > headerinfo.min) {
            this._headerDetails.pvmin = headerinfo.min;
        }

        if (this._headerDetails.pvmax === undefined || this._headerDetails.pvmax < headerinfo.max) {
            this._headerDetails.pvmax = headerinfo.max;
        }

        if (this._headerDetails.blank === undefined) {
            this._headerDetails.blank = headerinfo.blank;
        } else if (this._headerDetails.blank !== headerinfo.blank) {
            throw new ErrorEvent("BLANK value changed!");
        }

        if (this._headerDetails.bscale === undefined) {
            this._headerDetails.bscale = headerinfo.bscale;
        } else if (this._headerDetails.bscale !== headerinfo.bscale) {
            throw new ErrorEvent("BSCALE value changed!");
        }

        if (this._headerDetails.bzero === undefined) {
            this._headerDetails.bzero = headerinfo.bzero;
        } else if (this._headerDetails.bzero !== headerinfo.bzero) {
            throw new ErrorEvent("BZERO value changed!");
        }

        if (this._headerDetails.bitpix === undefined) {
            this._headerDetails.bitpix = headerinfo.bitpix;
        } else if (this._headerDetails.bitpix !== headerinfo.bitpix) {
            throw new ErrorEvent("BITPIX value changed!");
        }

    }

    getFITSData () {
        this.finalizeFITSHeader();
        return {
            "FITSHeader" : this._projection._fitsheader,
            "FITSData" : this._pixelsValues
        };
    }

    finalizeFITSHeader () {
        this._projection.finalizeFITSHeader(this._headerDetails);
    }

    generateCanvas2d() {
        let canvas2d = new Canvas2D(this._naxis1, this._naxis2, this._headerDetails.pvmin, this._headerDetails.pvmax, this._pixelsValues);
        return canvas2d;
    }


    
}

export default Image;