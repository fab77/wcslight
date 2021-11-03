"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */


import AbstractProjection from './AbstractProjection.js';
// import ParseUtils from '../ParseUtils';
import ImagePixel from '../model/ImagePixel.js';
import FITSHeader from '../../../FITSParser/src/FITSHeader.js';
import Canvas2D from '../model/Canvas2D.js';
import FITSParser from '../../../FITSParser/src/FITSParser.js';
import ParseUtils from '../../../FITSParser/src/ParseUtils.js';

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
    constructor (infile) {
        super();
        this._ctype1 = "RA---MER";
        this._ctype2 = "DEC--MER";
        
		if (infile) {
		// 	this.initFromFile(infile);
            this._inflie = infile;
            // return this.initFromFile(this._inflie);
		}
        // return this;
    }


    async initFromFile (infile) {
		var self = this;
		let promise = new FITSParser(infile).then(fits => {

            console.log(fits.header);
            self._pxvalues = fits.data;
            self._fitsheader = fits.header;
            self._naxis1 = fits.header.get("NAXIS1");
            self._naxis2 = fits.header.get("NAXIS2");
            self._cra = fits.header.get("CRVAL1");
            self._cdec = fits.header.get("CRVAL2");
            
            self._pxsize1 = self._fitsheader.get("CDELT1");
            self._pxsize2 = self._fitsheader.get("CDELT2");

            self._minra = self._cra - self._pxsize1 * self._naxis1/2;
            if (self._minra < 0) {
                self._minra += 360;
            }
            self._mindec = self._cdec - self._pxsize2 * self._naxis2/2;

            return {
                "fitsheader": fits.header,
                "fitsdata": fits.data,
                "canvas2d": self.getCanvas2d()
            }

        });
        await promise;
        return promise;
	}

    prepareFITSHeader (fitsHeaderParams) {
		// TODO
		this._fitsheader = new FITSHeader();
        
        this._fitsheader.set("SIMPLE", fitsHeaderParams.get("SIMPLE"));
        this._fitsheader.set("BITPIX", fitsHeaderParams.get("BITPIX"));
        this._fitsheader.set("BLANK", fitsHeaderParams.get("BLANK"));
		this._fitsheader.set("BSCALE", fitsHeaderParams.get("BSCALE"));
		this._fitsheader.set("BZERO", fitsHeaderParams.get("BZERO"));
		this._fitsheader.set("NAXIS", 2);
        this._fitsheader.set("NAXIS1", this._naxis1);
		this._fitsheader.set("NAXIS2", this._naxis2);
		
		this._fitsheader.set("CTYPE1", this._ctype1);
		this._fitsheader.set("CTYPE2", this._ctype2);
		
        this._fitsheader.set("CDELT1", this._pxsize); // ??? Pixel spacing along axis 1 ???
        this._fitsheader.set("CDELT2", this._pxsize); // ??? Pixel spacing along axis 2 ???
        this._fitsheader.set("CRPIX1", this._naxis1/2); // central/reference pixel i along naxis1
        this._fitsheader.set("CRPIX2", this._naxis2/2); // central/reference pixel j along naxis2
        this._fitsheader.set("CRVAL1", this._cra); // central/reference pixel RA
        this._fitsheader.set("CRVAL2", this._cdec); // central/reference pixel Dec

        let min = fitsHeaderParams.get("BZERO") + fitsHeaderParams.get("BSCALE") * this._minphysicalval;
        let max = fitsHeaderParams.get("BZERO") + fitsHeaderParams.get("BSCALE") * this._maxphysicalval;
        this._fitsheader.set("DATAMIN", min); // min data value
        this._fitsheader.set("DATAMAX", max); // max data value

        
        this._fitsheader.set("ORIGIN", "WCSLight v.0.x");
        this._fitsheader.set("COMMENT", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar");

		return this._fitsheader;
		
	}
    getFITSHeader() {
        return this._fitsheader;
    }

    loadFITS(fitsuri, observerlist) {
		return this.initFromFile(fitsuri, observerlist);
	}

    getCommonFitsHeaderParams() {
		let header = new FITSHeader();
        for (const [key, value] of this._fitsheader) {
            // I could add a list of used NPIXs to be included in the comment of the output FITS
            if (["SIMPLE", "BSCALE", "BZERO", "BLANK", "BITPIX", "ORDER", "COMMENT", "CPYRIGH", "ORIGIN"].includes(key)) {
                
                header.set(key, value);
                
            }
        }
        return header;
	}

    // prepareCommonHeader(){
	// 	// console.log(fitsheaderlist);
	// 	if (!this._fh_common) {
	// 		this._fh_common = new FITSHeader();
	// 	}

	
    //     let header = this._fitsheader;
    //     for (const [key, value] of header) {
    //         // I could add a list of used NPIXs to be included in the comment of the output FITS
    //         if (["SIMPLE", "BSCALE", "BZERO", "BLANK", "BITPIX", "ORDER", "COMMENT", "CPYRIGH", "ORIGIN"].includes(key)) {
    //             if (!this._fh_common.get(key)) {
    //                 this._fh_common.set(key, value);
    //             } else if (this._fh_common.get(key) !== value) { // this should not happen 
    //                 throw new Error("Error parsing headers. "+key+" was "+this._fh_common.get(key)+" and now is "+value);
    //             }
    //         }
    //     }
	// }

    async getPixValues(inputPixelsList) {

        var self = this;
        let promise = new Promise ( (resolve, reject) => {
            try {
                let bytesXelem = Math.abs(this._fitsheader.get("BITPIX") / 8);
                let blankBytes = ParseUtils.convertBlankToBytes(this._fitsheader.get("BLANK"), bytesXelem);
                let pixcount = inputPixelsList.length;
                // var values = new Array(pixcount);
                
                var values = new Uint8Array(pixcount * bytesXelem);
                
                for (let j = 0; j < pixcount; j++ ){
                    if (j == 23 ){
                        console.log(j);
                    }
                    let imgpx = inputPixelsList[j];
                    // TODO check when input is undefined. atm it puts 0 bur it should be BLANK
                    if ( (imgpx._j-1) < 0 || (imgpx._j-1) > this._naxis2 ||
                        (imgpx._i-1) < 0 || (imgpx._i-1) > this._naxis1) {
                            // values[j] = this._fitsheader.get("BLANK");
                            for (let i = 0; i < bytesXelem; i++) {
                                values[j * bytesXelem + i] = blankBytes[i];
                            }
                        }else {
                            // values[j] = this._pxvalues[imgpx._j - 1][imgpx._i - 1];
                            for (let i = 0; i < bytesXelem; i++) {
                                values[j * bytesXelem + i] = this._pxvalues[imgpx._j - 1][(imgpx._i - 1) * bytesXelem  + i];
                            }
                            
                        }
                }
                // self.prepareCommonHeader();
                resolve(values);
            } catch(err) {
                reject("[MercatorProjection] ERROR: "+err);
            }
            
        });
        return promise;
		

        // var promise = await new FITSParser(fitsurl).then( (fits) => {
		
        //     fitsheader = fits.header;
            
        //     for (let j = 0; j < pixcount; j++ ){
        //         let imgpx = inputPixelsList[j];
        //         values[j] = fits.data[imgpx.j][imgpx.i];
        //     }

        // });

		// this.prepareCommonHeader(fitsheader);
		// return values;
	}

    
    computeSquaredNaxes (d, ps) {
        // first aprroximation to be checked
        this._naxis1 =  Math.ceil(d / ps);
        this._naxis2 = this._naxis1;
        this._pxsize = ps;
    }

    

    setPxsValue(values, fitsHeaderParams) {
        
        this._minphysicalval = fitsHeaderParams.get("BZERO") + fitsHeaderParams.get("BSCALE") * values[0];
        this._maxphysicalval = fitsHeaderParams.get("BZERO") + fitsHeaderParams.get("BSCALE") * values[0];
        this._pxvalues = new Array(this._naxis2);
        // this._pxvalues = new Uint8Array(this._naxis2);
        let vidx = 0;

        for (let j = 0; j < this._naxis2; j++) {
            this._pxvalues[j] = new Array(this._naxis1);
            // this._pxvalues[j] = new Uint8Array(this._naxis1);
            for (let i = 0; i < this._naxis1; i++) {
                
                // in case on unidimensional input array
                // this._pxvalues[j][i] = values[j][i];
                // if (values[j][i] < this._minval) {
                //     this._minval = values[j][i];
                // } else if (values[j][i] < this._maxval) {
                //     this._maxval = values[j][i];
                // }

                this._pxvalues[j][i] = values[vidx];
                let valphysical = fitsHeaderParams.get("BZERO") + fitsHeaderParams.get("BSCALE") * this._pxvalues[j][i];

                if (valphysical < this._minphysicalval || isNaN(minphysicalval)) {
                    this._minphysicalval = valphysical;
                } else if (valphysical > this._maxphysicalval || isNaN(maxphysicalval)) {
                    this._maxphysicalval = valphysical;
                }
                vidx += 1;
            }
        }
        this.prepareFITSHeader(fitsHeaderParams);
        return this._pxvalues;

    }

    

    getImageRADecList(center, radius, pxsize) {

        let promise = new Promise ( (resolve, reject) => {
            this.computeSquaredNaxes (2 * radius, pxsize); // compute naxis[1, 2]
            this._cra = center.ra;
            this._cdec = center.dec;
            this._pxsize = pxsize;
            this._minra = center.ra - radius;
            if (this._minra < 0) {
                this._minra += 360;
            }
            this._mindec = center.dec - radius;
            
            // let radecmap = new Map();;
            let radeclist = [];
            for (let cra = this._minra; cra < this._minra + this._pxsize * (this._naxis1); cra += this._pxsize) {
                for (let cdec = this._mindec; cdec < this._mindec + this._pxsize * (this._naxis2); cdec += this._pxsize) {
                    radeclist.push([cra, cdec]);
                }
            }
            // return radecmap.set(0, radeclist);
            resolve(radeclist);
        });
        return promise;
        
    }

    /** TODO !!! check and handle RA passing through 360-0 */
    pix2world (i, j) {

        let ra, dec;
        ra = i * this._stepra + this._minra;
        dec = j * this._stepdec + this._mindec;
        return [ra, dec];

    }

    world2pix (radeclist) {

        let promise = new Promise ( (resolve, reject) => {
            
            this.initFromFile(this._inflie).then( (data) => {
                let imgpxlist = [];
    
                // HERE I NEED this._minra, this._mindec and this._pxsize!!!
                radeclist.forEach(([ra, dec]) => {
                    // if (minra <= ra && ra <= maxra &&
                    //     mindec <= dec && dec <= maxdec) {
                    let i = Math.floor((ra - this._minra) / this._pxsize1);
                    let j = Math.floor((dec - this._mindec) / this._pxsize2);
                    imgpxlist.push(new ImagePixel(i, j));
                        // }
                });
                resolve(imgpxlist);
                // return imgpxlist;
            });
            
        });
        return promise;
        
    }

    getCanvas2d(tfunction = "linear", colormap = "grayscale", inverse = false) {

		let canvas2d =  new Canvas2D(this._pxvalues, this._fitsheader, this, tfunction, colormap, inverse);
		return canvas2d;
	}

   
}

export default MercatorProjection;