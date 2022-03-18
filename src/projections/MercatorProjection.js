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
import FITSHeaderItem from '../../../FITSParser/src/FITSHeaderItem.js';
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
            
            // self._cra = fits.header.get("CRVAL1");
            // self._cdec = fits.header.get("CRVAL2");
            
            // self._pxsize1 = self._fitsheader.get("CDELT1");
            // self._pxsize2 = self._fitsheader.get("CDELT2");
            self._cra = fits.header.getItemListOf("CRVAL1")[0].value;
            self._cdec = fits.header.getItemListOf("CRVAL2")[0].value;
            
            // TODO CDELT could not be present. In this is the case, 
            // there should be CDi_ja, but I am not handling them atm
            // [Ref. Representation of celestial coordinates in FITS - equation (1)]
            self._pxsize1 = self._fitsheader.getItemListOf("CDELT1")[0].value;
            self._pxsize2 = self._fitsheader.getItemListOf("CDELT2")[0].value;

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

		this._fitsheader = new FITSHeader();
        
        
        this._fitsheader.addItemAtTheBeginning(new FITSHeaderItem("BITPIX", fitsHeaderParams.get("BITPIX")));
		this._fitsheader.addItemAtTheBeginning(new FITSHeaderItem("SIMPLE", fitsHeaderParams.get("SIMPLE")));

        if (fitsHeaderParams.get("BLANK") !== undefined) {
            this._fitsheader.addItem(new FITSHeaderItem("BLANK", fitsHeaderParams.get("BLANK")));
        }

        let bscale = 1.0;
        if (fitsHeaderParams.get("BSCALE") !== undefined) {
            bscale = fitsHeaderParams.get("BSCALE");
        } 
        this._fitsheader.addItem(new FITSHeaderItem("BSCALE", bscale));

        let bzero = 0.0;
        if (fitsHeaderParams.get("BZERO") !== undefined) {
            bzero = fitsHeaderParams.get("BZERO");
        } 
        this._fitsheader.addItem(new FITSHeaderItem("BZERO", bzero));
		
		
		this._fitsheader.addItem(new FITSHeaderItem("NAXIS", 2));
        this._fitsheader.addItem(new FITSHeaderItem("NAXIS1", this._naxis1));
		this._fitsheader.addItem(new FITSHeaderItem("NAXIS2", this._naxis2));
		
		this._fitsheader.addItem(new FITSHeaderItem("CTYPE1", this._ctype1));
		this._fitsheader.addItem(new FITSHeaderItem("CTYPE2", this._ctype2));
		
        this._fitsheader.addItem(new FITSHeaderItem("CDELT1", this._pxsize)); // ??? Pixel spacing along axis 1 ???
        this._fitsheader.addItem(new FITSHeaderItem("CDELT2", this._pxsize)); // ??? Pixel spacing along axis 2 ???
        this._fitsheader.addItem(new FITSHeaderItem("CRPIX1", this._naxis1/2)); // central/reference pixel i along naxis1
        this._fitsheader.addItem(new FITSHeaderItem("CRPIX2", this._naxis2/2)); // central/reference pixel j along naxis2
        this._fitsheader.addItem(new FITSHeaderItem("CRVAL1", this._cra)); // central/reference pixel RA
        this._fitsheader.addItem(new FITSHeaderItem("CRVAL2", this._cdec)); // central/reference pixel Dec

        let min = bzero + bscale * this._minphysicalval;
        let max = bzero + bscale * this._maxphysicalval;
        this._fitsheader.addItem(new FITSHeaderItem("DATAMIN", min)); // min data value
        this._fitsheader.addItem(new FITSHeaderItem("DATAMAX", max)); // max data value

        
        this._fitsheader.addItem(new FITSHeaderItem("ORIGIN", "WCSLight v.0.x"));
        this._fitsheader.addItem(new FITSHeaderItem("COMMENT", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar"));
        this._fitsheader.addItem(new FITSHeaderItem("END"));

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
            if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER",].includes(key)) {
                
                // header.set(key, value);
                header.addItem(new FITSHeaderItem(key, value));
                
            }
        }
        return header;
	}

    async getPixValues(inputPixelsList) {

        let promise = new Promise ( (resolve, reject) => {
            try {
                let bytesXelem = Math.abs(this._fitsheader.get("BITPIX") / 8);
                let blankBytes = ParseUtils.convertBlankToBytes(this._fitsheader.get("BLANK"), bytesXelem);
                let pixcount = inputPixelsList.length;
                
                var values = new Uint8Array(pixcount * bytesXelem);
                
                for (let p = 0; p < pixcount; p++ ){

                    let imgpx = inputPixelsList[p];
                    // TODO check when input is undefined. atm it puts 0 bur it should be BLANK
                    // TODO why I am getting negative i and j? check world2pix!!!
                    if ( (imgpx._j) < 0 || (imgpx._j) >= this._naxis2 ||
                        (imgpx._i) < 0 || (imgpx._i) >= this._naxis1) {
                            for (let b = 0; b < bytesXelem; b++) {
                                values[p * bytesXelem + b] = blankBytes[b];
                            }
                        }else {
                            for (let b = 0; b < bytesXelem; b++) {
                                values[p * bytesXelem + b] = this._pxvalues[imgpx._j][(imgpx._i) * bytesXelem  + b];
                            }
                            
                        }
                }
                resolve(values);
            } catch(err) {
                reject("[MercatorProjection] ERROR: "+err);
            }
            
        });
        return promise;

	}

    
    computeSquaredNaxes (d, ps) {
        // first aprroximation to be checked
        this._naxis1 =  Math.ceil(d / ps);
        this._naxis2 = this._naxis1;
        this._pxsize = ps;
    }

    

    setPxsValue(values, fitsHeaderParams) {
        
        let bytesXelem = Math.abs(fitsHeaderParams.get("BITPIX") / 8);
        let minpixb = ParseUtils.extractPixelValue(0, values.slice(0, bytesXelem), fitsHeaderParams.get("BITPIX"));
        let maxpixb = minpixb;

        let bscale = (fitsHeaderParams.get("BSCALE") !== undefined) ? fitsHeaderParams.get("BSCALE") : 1.0;
        let bzero = (fitsHeaderParams.get("BZERO") !== undefined) ? fitsHeaderParams.get("BZERO") : 0.0;
        
        this._minphysicalval = bzero + bscale * minpixb;
        this._maxphysicalval = bzero + bscale * maxpixb;
        this._pxvalues = new Array(this._naxis2);
        for (let r = 0; r < this._naxis2; r++) {
            this._pxvalues[r] = new Uint8Array(this._naxis1 * bytesXelem);
        }

        let r, c, b;
        for (let p = 0; (p*bytesXelem) < values.length; p++) {
            // console.log("processing "+p + " of "+ (values.length / bytesXelem));

                try {
                    r = Math.floor( p / this._naxis1);
                    c = (p - r * this._naxis1) * bytesXelem;
                    
                    for (b = 0; b < bytesXelem; b++) {
                        this._pxvalues[r][c + b] = values[p * bytesXelem + b];
                    }
                
    
                    let valpixb = ParseUtils.extractPixelValue(0, values.slice(p * bytesXelem, (p * bytesXelem) + bytesXelem), fitsHeaderParams.get("BITPIX"));
                    let valphysical = bzero + bscale * valpixb;
                    
                    if (valphysical < this._minphysicalval || isNaN(this._minphysicalval)) {
                        this._minphysicalval = valphysical;
                    } else if (valphysical > this._maxphysicalval || isNaN(this._maxphysicalval)) {
                        this._maxphysicalval = valphysical;
                    }
                }catch (err) {
                    console.log(err)
                    console.log("p "+p)
                    console.log("r %, c %, b %"+r,c,b)
                    console.log("this._pxvalues[r][c + b] "+this._pxvalues[r][c + b])
                    console.log("values[p * bytesXelem + b] "+values[p * bytesXelem + b])
                }

        }
        
        this.prepareFITSHeader(fitsHeaderParams);
        return this._pxvalues;

    }

    

    getImageRADecList(center, radius, pxsize) {

        let promise = new Promise ( (resolve, reject) => {
            this.computeSquaredNaxes (2 * radius, pxsize); // compute naxis[1, 2]
            // this._cra = center.ra;
            // this._cdec = center.dec;
            this._pxsize = pxsize;
            this._minra = center.ra - radius;
            if (this._minra < 0) {
                this._minra += 360;
            }
            this._mindec = center.dec - radius;
            
            let radeclist = [];
            let pra, pdec;

            // for (pdec = this._mindec; pdec < this._mindec + this._pxsize * this._naxis2; pdec += this._pxsize) {
            //     for (pra = this._minra; pra < this._minra + this._pxsize * this._naxis1; pra += this._pxsize) {
            //         radeclist.push([pra, pdec]);
            //     }
            // }

            
            for (let d = 0; d < this._naxis2; d++) {
                for (let r = 0; r < this._naxis1; r++) {
                    radeclist.push([ this._minra + (r * this._pxsize), this._mindec + (d * this._pxsize)]);
                }    
            }

            // for (pdec = this._mindec; pdec < this._mindec + this._pxsize * this._naxis2; pdec += this._pxsize) {
            //     for (pra = this._minra; pra < this._minra + this._pxsize * this._naxis1; pra += this._pxsize) {
            //         radeclist.push([pra, pdec]);
            //     }
            // }

            let cidx = (this._naxis2/2 - 1) * this._naxis1 +  this._naxis1/2;
            this._cra = radeclist[ cidx ][0];
            this._cdec = radeclist[ cidx ][1];
            
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
                    // if (i < 0 || i >= this._naxis1 || j < 0 || j >= this._naxis2 ){
                    //     imgpxlist.push(null);
                    // } else {
                        // console.log("STOP!");
                        imgpxlist.push(new ImagePixel(i, j));
                    // }
                    
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