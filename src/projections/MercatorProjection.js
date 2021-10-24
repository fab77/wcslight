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
import ImagePixel from '../model/ImagePixel';
import Canvas2D from '../model/Canvas2D';
import FITSParser from "FITSParser";

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
    constructor (fitsFilelist) {
        super();
        super();
		if (fitsFilelist) {
			this._fitsFilelist = fitsFilelist;
			if (this._fitsFilelist.length >= 1) {
				this.initFromFile(0);
			}
		}
		this._fitsheaderlist = [];
    }

    initFromFile (fitsIndex) {
		let fitsURL = this._fitsFilelist[fitsIndex];
		let fits = new FITSParser(fitsURL);
		this._fitsdata = fits.data;
		this._fitsheaderlist.push(fits.header);
		this._naxis1 = fits.header.naxis1;
		this._naxis2 = fits.header.naxis2;
	}

    computePixValues() {
		let data = this._fitsdata;
		let header = this._fitsheaderlist[0];
		
		this.setFITSHeaderEntry("SIMPLE", header.simple);
		this.setFITSHeaderEntry("BLANK", header.blank);
		this.setFITSHeaderEntry("BZERO", header.bzero);
		this.setFITSHeaderEntry("BSCALE", header.bscale);
		this.setFITSHeaderEntry("NAXIS1", header.naxis1);
		this.setFITSHeaderEntry("NAXIS2", header.naxis2);
		
		let values = new Array(this._naxis2);
		for (let j = 0; j < this._naxis2; j++ ){
			if (!values[j]) {
				values[j] = new Array(this._naxis1);
			}
			for (let i = 0; i < this._naxis1; i++ ){
				values[j][i] = data[j][i];		
			}
		}
		this._pxvalues = values;
		return values;
	}

    prepareFITSHeader (fitsHeaderParams) {
		// TODO
		this._fitsheader = new FITSHeader();
        
        this._fitsheader.set("SIMPLE", fitsHeaderParams["SIMPLE"]);
		this._fitsheader.set("NAXIS1", this._naxis1);
		this._fitsheader.set("NAXIS2", this._naxis2);
		this._fitsheader.set("ORDER", this._norder);
		this._fitsheader.set("NPIX", this._pixno);
		this._fitsheader.set("BLANK", fitsHeaderParams["BLANK"]);
		this._fitsheader.set("BSCALE", fitsHeaderParams["BSCALE"]);
		this._fitsheader.set("BZERO", fitsHeaderParams["BZERO"]);
		this._fitsheader.set("CTYPE1", "RA---MER");
		this._fitsheader.set("CTYPE2", "DEC--MER");
		
        this._fitsheader.set("CDELT1", this._pxsize); // ??? Pixel spacing along axis 1 ???
        this._fitsheader.set("CDELT2", this._pxsize); // ??? Pixel spacing along axis 2 ???
        this._fitsheader.set("CRPIX1", this._naxis1/2); // central/reference pixel i along naxis1
        this._fitsheader.set("CRPIX2", this._naxis2/2); // central/reference pixel j along naxis2
        this._fitsheader.set("CRVAL1", this._cra); // central/reference pixel RA
        this._fitsheader.set("CRVAL2", this._cdec); // central/reference pixel Dec

        let min = fitsHeaderParams["BZERO"] + fitsHeaderParams["BSCALE"] * this._minval;
        let max = fitsHeaderParams["BZERO"] + fitsHeaderParams["BSCALE"] * this._maxval;
        this._fitsheader.set("DATAMIN", min); // min data value
        this._fitsheader.set("DATAMAX", max); // max data value

        this._fitsheader.set("WCSNAME", "HiPS");
        this._fitsheader.set("ORIGIN", "WCSLight v.0.x");
        this._fitsheader.set("COMMENT", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar");

		return this._fitsheader;
		
	}
    getFITSHeader() {
        return this._fitsheader;
    }
   
    getPixValuesFromPxlist(inputPixelsList) {


		// I need association ImgPixel -> file

		let pixcount = inputPixelsList.length;
		let values = new Array(pixcount);

        this.setFITSHeaderEntry("SIMPLE", fits.header.simple);
        this.setFITSHeaderEntry("BLANK", fits.header.blank);
        this.setFITSHeaderEntry("BZERO", fits.header.bzero);
        this.setFITSHeaderEntry("BSCALE", fits.header.bscale);

        for (let j = 0; j < pixcount; j++ ){
            let imgpx = inputPixelsList[j];
            values[j] = fits.data[imgpx.j][imgpx.i];
        }

        // THE FOLLOWING IN CASE I WANT TO HANDLE MULTIPLE FILES HERE
        // for (let f = 0; f < this._fitsFilelist.length; f++) {
        //     let fits = new FITSParser(this._fitsFilelist[f]);
        //     this._fitsheaderlist.push(fits.header);
        //     // TODO group these functions in one method
        //     this.setFITSHeaderEntry("SIMPLE", fits.header.simple);
        //     this.setFITSHeaderEntry("BLANK", fits.header.blank);
        //     this.setFITSHeaderEntry("BZERO", fits.header.bzero);
        //     this.setFITSHeaderEntry("BSCALE", fits.header.bscale);

        //     for (let j = 0; j < pixcount; j++ ){
        //         let imgpx = inputPixelsList[j];
        //         if (imgpx.tileno === f) {
        //             values[j] = fits.data[imgpx.j][imgpx.i];
        //         }
        //     }
        // }
		
		return values;
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

    setPxsValue(values, fitsHeaderParams) {
        
        this._minval = this._pxvalues[0];
        this._maxval = this._pxvalues[0];
        this._pxvalues = new Array(this._naxis2);
        let vidx = 0;

        for (let j = 0; j < this._naxis2; j++) {
            this._pxvalues[j] = new Array(this._naxis1);
            for (let i = 0; i < this._naxis1; i++) {
                this._pxvalues[j][i] = values[vidx];
                if (values[vidx] < this._minval) {
                    this._minval = values[vidx];
                } else if (values[vidx] < this._maxval) {
                    this._maxval = values[vidx];
                }
                vidx += 1;
            }
        }
        this.prepareFITSHeader(fitsHeaderParams);
        return this._pxvalues;

    }

    world2pix (radeclist) {
        let imgpxlist = [];

        radeclist.forEach((ra, dec) => function() {
            if (minra <= ra && ra <= maxra &&
                mindec <= dec && dec <= maxdec) {
                    let i = Math.floor((ra - minra) / this._pxsize);
                    let j = Math.floor((dec - mindec) / this._pxsize);
                    imgpxlist.push(new ImagePixel(i, j));
                }
        });

        // THE FOLLOWING IN CASE I WANT TO HANDLE MULTIPLE FILE HERE
        // for (let f = 0; f < this._fitsFilelist; f++) {
        //     let fits = new FITSParser(this._fitsFilelist[i]);
        //     let header = fits.header;
        //     this._fitsheaderlist.push(header);
        //     // with header naxis[1,2], cra, cdec, cdelt1, cdelt2 compute bbox
        //     let cdelt1 = header.cdelt1; // ??? Pixel spacing along axis 1 ???
        //     let cdelt2 = header.cdelt2; // ??? Pixel spacing along axis 2 ???
        //     let ci = header.crpix1; // central/reference pixel i along naxis1
        //     let cj = header.crpix2; // central/reference pixel j along naxis2
        //     let crval1 = header.crval1; // central/reference pixel RA
        //     let crval2 = header.crval2; // central/reference pixel Dec
        //     let naxis1 = header.naxis1;
        //     let naxis2 = header.naxis2;

        //     // TODO if the projection is rotated, use CROTAn to rotate 
        //     let maxra = crval1 + (naxis1 - ci) * cdelt1;
        //     let maxdec = crval2 + (naxis2 - cj) * cdelt2;
        //     let minra = crval1 - ci * cdelt1;
        //     let mindec = crval2 - ci * cdelt2;

            

        //     radeclist.forEach((ra, dec) => function() {
        //         if (minra <= ra && ra <= maxra &&
        //             mindec <= dec && dec <= maxdec) {
        //                 let i = Math.floor((ra - minra) / this._pxsize);
        //                 let j = Math.floor((dec - mindec) / this._pxsize);
        //                 imgpxlist.push(new ImagePixel(i, j, f));
        //             }
        //     });
        // }

        return imgpxlist;
    }

    getImageRADecList(center, radius, pxsize) {

        this.computeSquaredNaxes (2 * radius, pxsize); // compute naxis[1, 2]
        this._cra = center.raDeg;
        this._cdec = center.decDeg;
        this._pxsize = pxsize;
        this._minra = center.raDeg - radius;
        if (this._minra < 0) {
            this._minra += 360;
        }
        this._mindec = center.decDeg - radius;
        
        let radecmap = new Map();;
        radeclist = [];
        for (let cra = this._minra; cra < (this._pxsize * this._naxis1); cra += this._pxsize) {
            for (let cdec = this._mindec; cdec < (this._pxsize * this._naxis2); cdec += this._pxsize) {
                radeclist.push([cra, cdec]);
            }
        }
        return radecmap.set(0, radeclist);
    }

    getCanvas2d(tfunction = "linear", colormap = "grayscale", inverse = false) {

		let canvas2d =  new Canvas2D(this._pxvalues, this, tfunction, colormap, inverse);
		return canvas2d;
	}

   
}

export default MercatorProjection;