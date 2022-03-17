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
import { cot, arg } from 'mathjs'


class GnomonicProjection extends AbstractProjection {

    _minra;
    _mindec;
    _naxis1;
    _naxis2;
    _pxsize;
    _pxmatrix;
    _fitsheader;

    
    constructor (infile) {
        super();
        this._ctype1 = "RA---TAN";
        this._ctype2 = "DEC--TAN";
        
		if (infile) {
            this._inflie = infile;
		}
    }

    async initFromFile (infile) {

        let promise = new FITSParser(infile).then(fits => {

            console.log(fits.header);
            this._pxvalues = fits.data;
            this._fitsheader = fits.header;
            this._naxis1 = fits.header.get("NAXIS1");
            this._naxis2 = fits.header.get("NAXIS2");
            
            this._cra = fits.header.getItemListOf("CRVAL1")[0].value;
            this._cdec = fits.header.getItemListOf("CRVAL2")[0].value;
            
            // TODO CDELT could not be present. In this is the case, 
            // there should be CDi_ja, but I am not handling them atm
            // [Ref. Representation of celestial coordinates in FITS - equation (1)]
            if (this._fitsheader.getItemListOf("CDELT1").length > 0) {
                this._pxsize1 = this._fitsheader.getItemListOf("CDELT1")[0].value;
                this._pxsize2 = this._fitsheader.getItemListOf("CDELT2")[0].value;
            }
            


            this._minra = this._cra - this._pxsize1 * this._naxis1/2;
            if (this._minra < 0) {
                this._minra += 360;
            }
            this._mindec = this._cdec - this._pxsize2 * this._naxis2/2;

            return {
                "fitsheader": fits.header,
                "fitsdata": fits.data,
                "canvas2d": this.getCanvas2d()
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
                // TODO ...
                resolve(values);
            } catch(err) {
                reject("[GnomonicProjection] ERROR: "+err);
            }
            
        });
        return promise;

	}    

    computeSquaredNaxes (d, ps) {

        // ??? APPLICABLE WITH THIS PROJECTION ???
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

        // TODO ...
    }

    getImageRADecList(center, radius, pxsize) {

        let promise = new Promise ( (resolve, reject) => {
            this.computeSquaredNaxes (2 * radius, pxsize); // compute naxis[1, 2]

            this._pxsize = pxsize;
            this._minra = center.ra - radius;
            if (this._minra < 0) {
                this._minra += 360;
            }
            this._mindec = center.dec - radius;
            
            let radeclist = [];
            let pra, pdec;

            // TODO ...
            /*
            basing on naxis1 and naxis2 call pix2world!!!
            */



            /*
            

            mindec = center.dec - radius;
            maxdec = center.dec + radius;
            below pixel size should  depend on the distance from the center
            let l =  0;
            let factor = 1;
            
            for (let d = mindec; d < maxdec; d+=pxsize) { <--ERROR the external loop must be over RA
                factor = 1 + 2**l;
                rapxsize = pxsize/factor;
                for (let r = 0; r < 360; r+=rapxsize) {
                    radeclist.push(r, d); 
                }
                l++;
            }
            */ 




            
            let cidx = (this._naxis2/2 - 1) * this._naxis1 +  this._naxis1/2;
            this._cra = radeclist[ cidx ][0];
            this._cdec = radeclist[ cidx ][1];
            
            resolve(radeclist);
        });
        return promise;
        
    }

    pix2world (i, j) {

        // TODO ...
        let x, y;
        let CDELT1 = this._fitsheader.getItemListOf("CDELT1")[0];
        let CDELT2 = this._fitsheader.getItemListOf("CDELT2")[0];
        let PC1_1 = this._fitsheader.getItemListOf("PC1_1")[0];
        let PC1_2 = this._fitsheader.getItemListOf("PC1_2")[0];
        let PC2_1 = this._fitsheader.getItemListOf("PC2_1")[0];
        let PC2_2 = this._fitsheader.getItemListOf("PC2_2")[0];

        let CD1_1 = this._fitsheader.getItemListOf("CD1_1")[0];
        let CD1_2 = this._fitsheader.getItemListOf("CD1_2")[0];
        let CD2_1 = this._fitsheader.getItemListOf("CD2_1")[0];
        let CD2_2 = this._fitsheader.getItemListOf("CD2_2")[0];

        let CRPIX1 = this._fitsheader.getItemListOf("CRPIX1")[0];
        let CRPIX2 = this._fitsheader.getItemListOf("CRPIX2")[0];

    
        if ( CDELT1 !== undefined && CDELT2 !== undefined && 
                PC1_1 !== undefined && PC1_2 !== undefined &&
                PC2_1 !== undefined && PC2_2 !== undefined
        ) { // if CDELTia and PCi_ja notation
            x = CDELT1 * (PC1_1*(i - CRPIX1) + PC1_2*(j-CRPIX2));
            y = CDELT2 * (PC2_1*(i - CRPIX1) + PC2_2*(j-CRPIX2));
        } else { // else CDi_ja notation
            x = CD1_1*(i - CRPIX1) + CD1_2*(j-CRPIX2);
            y = CD2_1*(i - CRPIX1) + CD2_2*(j-CRPIX2);
        }
        
            
        
            
        let phi = math.arg(-y/x);
        let R_theta = Math.sqrt(x*x + y*y);
        let theta = Math.atan2( 180 / (Math.PI * R_theta));

        let ra, dec;
        ra = phi;
        dec = theta;
        // TODO check if phi, theta match with ra, dec or they need to be (linearly) converted 

        return [ra, dec];

    }

    world2pix (radeclist) {

        
        let promise = new Promise ( (resolve, reject) => {
            
            this.initFromFile(this._inflie).then( (data) => {
                let imgpxlist = [];
    
                let CDELT1 = (this._fitsheader.getItemListOf("CDELT1").length > 0) ? this._fitsheader.getItemListOf("CDELT1")[0] : undefined;
                let CDELT2 = (this._fitsheader.getItemListOf("CDELT2").length > 0) ? this._fitsheader.getItemListOf("CDELT2")[0] : undefined;
                let PC1_1 = (this._fitsheader.getItemListOf("PC1_1").length > 0) ? this._fitsheader.getItemListOf("PC1_1")[0] : undefined;
                let PC1_2 = (this._fitsheader.getItemListOf("PC1_2").length > 0) ? this._fitsheader.getItemListOf("PC1_2")[0] : undefined;
                let PC2_1 = (this._fitsheader.getItemListOf("PC2_1").length > 0) ? this._fitsheader.getItemListOf("PC2_1")[0] : undefined;
                let PC2_2 = (this._fitsheader.getItemListOf("PC2_2").length > 0) ? this._fitsheader.getItemListOf("PC2_2")[0] : undefined;

                let CD1_1 = (this._fitsheader.getItemListOf("CD1_1").length > 0) ? this._fitsheader.getItemListOf("CD1_1")[0] : undefined;
                let CD1_2 = (this._fitsheader.getItemListOf("CD1_2").length > 0) ? this._fitsheader.getItemListOf("CD1_2")[0] : undefined;
                let CD2_1 = (this._fitsheader.getItemListOf("CD2_1").length > 0) ? this._fitsheader.getItemListOf("CD2_1")[0] : undefined;
                let CD2_2 = (this._fitsheader.getItemListOf("CD2_2").length > 0) ? this._fitsheader.getItemListOf("CD2_2")[0] : undefined;

                let CRPIX1 = (this._fitsheader.getItemListOf("CRPIX1").length > 0) ? this._fitsheader.getItemListOf("CRPIX1")[0] : undefined;
                let CRPIX2 = (this._fitsheader.getItemListOf("CRPIX2").length > 0) ? this._fitsheader.getItemListOf("CRPIX2")[0] : undefined;

                radeclist.forEach(([ra, dec]) => {

                    // TODO ...
                    let i, j;
                    // (linearly) convert ra, dec into phi, theta
                    let theta = dec;
                    let phi = ra;
                    let R_theta = (180/Math.PI) * math.cot(theta);
                    let x = R_theta * Math.sin(phi);
                    let y = - R_theta * Math.cos(phi);
                    if ( CDELT1 !== undefined && CDELT2 !== undefined && 
                                PC1_1 !== undefined && PC1_2 !== undefined &&
                                PC2_1 !== undefined && PC2_2 !== undefined
                        ) { // if CDELTia and PCi_ja notation
                        j = y*CDELT1*PC1_1 / (CDELT1*CDELT2*(PC1_1*PC2_2 - PC2_1*PC1_2)) + PC1_1*CRPIX2*(PC2_2 - PC2_1)/(PC1_1*PC2_2 - PC2_1*PC1_2);
                        i = x/(CDELT1*PC1_1) + CRPIX1 - j * PC1_2/PC1_1 + CRPIX2*PC1_2/PC1_1;
                    } else { // else CDi_ja notation
                        j = y*CD1_1/(CD1_1*CD2_2 - CD1_2*CD2_1) + CRPIX2*CD1_1* (CD2_2 - CD2_1) / (CD1_1*CD2_2 - CD1_2*CD2_1);
                        i = (x + CD1_1*CRPIX1 - CD1_2 * j + CD1_2 * CRPIX2) / CD1_1;
                    }
                    imgpxlist.push(new ImagePixel(i, j));

                });
                resolve(imgpxlist);
            });
            
        });
        return promise;
        
    }

    getCanvas2d(tfunction = "linear", colormap = "grayscale", inverse = false) {

		let canvas2d =  new Canvas2D(this._pxvalues, this._fitsheader, this, tfunction, colormap, inverse);
		return canvas2d;
	}
}

export default GnomonicProjection;