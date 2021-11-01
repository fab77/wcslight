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
// import FITSParser from 'fitsparser';
import FITSParser from '../../../FITSParser/src/FITSParser.js';

import Healpix from "../../../healpixjs/src/Healpix.js";
import { Hploc, Pointing } from "../../../healpixjs/src/Healpix.js";

import HiPSHelper from './HiPSHelper.js';
import ImagePixel from '../model/ImagePixel.js';
import Canvas2D from '../model/Canvas2D.js';
import FITSHeader from '../../../FITSParser/src/FITSHeader.js';



class HiPSProjection extends AbstractProjection {

	_naxis1;
    _naxis2;
    _pixno;
	_tileslist;
	_hp; _fh_common;

	constructor (fitsfilepath, hipsURI = null, pxsize = null, order = null) {

		super();
		this._wcsname = "HPX"; // TODO check WCS standard
        this._ctype1 = "RA---HPX";
        this._ctype2 = "DEC--HPX";

        // this.THETAX = Hploc.asin( (K - 1)/K );

		if (!fitsfilepath && !hipsURI) {
			throw new Error("One among fitsfilepath and hipsURI must be provided.")
		}
		if (hipsURI && !pxsize && !order) {
			throw new Error("One among pxsize and order must be provided.")
		}

		if (fitsfilepath) {
			this.initFromFile(fitsfilepath);
		} else if (pxsize) {
			this._hipsURI = hipsURI;
			this.initFromPxsize(pxsize);
		} else {
			this._hipsURI = hipsURI;
			this.initFromHiPSOrder(order);
		}
		this._fitsheaderlist = [];

    }

	async initFromFile (fitsfilepath) {
		var self = this;
		
		let promise = new FITSParser(fitsfilepath).then(fits => {
			
			
	
			self._pxvalues[0] = fits.data;
			self._fitsheaderlist[0] = fits.header;

			let order = fits.header.get("ORDER");
			self.initFromHiPSOrder(order);
			
			self._naxis1 = fits.header.get("NAXIS1");
			self._naxis2 = fits.header.get("NAXIS2");
			self._pixno = fits.header.get("NPIX");
			
			this._xyGridProj = HiPSHelper.setupByTile(self._pixno, self._hp);
			return {
				"fitsheader": fits.header,
                "fitsdata": fits.data,
                "canvas2d": self.getCanvas2d()
			}
		});
		await promise;
		
	}

	initFromPxsize (pxsize) {
		let hipsorder = HiPSHelper.computeHiPSOrder(pxsize);
		this.initFromHiPSOrder(hipsorder);
	}

	initFromHiPSOrder (hipsorder) {
		this._norder = hipsorder;
		this._nside = 2**hipsorder;
		this._hp = new Healpix(this._nside);
	}

	prepareFITSHeader (fitsHeaderParams) {
		for (let header of this._fitsheaderlist) {
			header.set("SIMPLE", fitsHeaderParams.get("SIMPLE"));
			header.set("BITPIX", fitsHeaderParams.get("BITPIX"));
			header.set("BLANK", fitsHeaderParams.get("BLANK"));
			header.set("BSCALE", fitsHeaderParams.get("BSCALE"));
			header.set("BZERO", fitsHeaderParams.get("BZERO"));
			header.set("NAXIS", 2);
			header.set("NAXIS1", HiPSHelper.DEFAULT_Naxis1_2);
			header.set("NAXIS2", HiPSHelper.DEFAULT_Naxis1_2);
			
			header.set("CTYPE1", this._ctype1);
			header.set("CTYPE2", this._ctype2);
			
			header.set("CDELT1", this._pxsize); // ??? Pixel spacing along axis 1 ???
			header.set("CDELT2", this._pxsize); // ??? Pixel spacing along axis 2 ???
			header.set("CRPIX1", this._naxis1/2); // central/reference pixel i along naxis1
			header.set("CRPIX2", this._naxis2/2); // central/reference pixel j along naxis2
			
			// this._fitsheader.set("CRVAL1", this._cra); // central/reference pixel RA
        	// this._fitsheader.set("CRVAL2", this._cdec); // central/reference pixel Dec
			
			header.set("ORIGIN", "WCSLight v.0.x");
			header.set("COMMENT", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar");
		}
		return this._fitsheaderlist;
	}


	getFITSHeader() {
		return this._fitsheaderlist;
		// return this._fh;
	}

	loadFITS(fitsuri, observerlist) {
		return this.initFromFile(fitsuri, observerlist);
	}

	async getPixValues(inputPixelsList) {
	
		let tilesset = new Set();
		inputPixelsList.forEach ((imgpx) =>  {
				tilesset.add(imgpx.tileno);
		});

		let pixcount = inputPixelsList.length;
		var values = new Array(pixcount);
		var fitsheaderlist = [];
		var promises = [];

		for (let hipstileno of tilesset) {

			let dir = Math.floor(hipstileno/10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
			let fitsurl = this._hipsURI+"/Norder"+this._norder+"/Dir"+dir+"/Npix"+hipstileno+".fits";
			promises.push(new FITSParser(fitsurl).then( (fits) => {
	
				fitsheaderlist.push(fits.header);
			
				for (let j = 0; j < pixcount; j++ ){
					let imgpx = inputPixelsList[j];
					if (imgpx.tileno === hipstileno) {
						
						values[j] = fits.data[imgpx._j][imgpx._i];

					}
				}

			}));

		}
		await Promise.all(promises);
		this.prepareCommonHeader(fitsheaderlist);
		return values;
	}

	getCommonFitsHeaderParams() {
		return this._fh_common;
	}

	prepareCommonHeader(fitsheaderlist){
		// console.log(fitsheaderlist);
		if (!this._fh_common) {
			this._fh_common = new FITSHeader();
		}

		for (let i = 0; i< fitsheaderlist.length; i++) {
			let header = fitsheaderlist[i];
			for (const [key, value] of header) {
				// I could add a list of used NPIXs to be included in the comment of the output FITS
				if (["SIMPLE", "BSCALE", "BZERO", "BLANK", "BITPIX", "ORDER", "COMMENT", "CPYRIGH", "ORIGIN"].includes(key)) {
					if (!this._fh_common.get(key)) {
						this._fh_common.set(key, value);
					} else if (this._fh_common.get(key) !== value) { // this should not happen 
						throw new Error("Error parsing headers. "+key+" was "+this._fh_common.get(key)+" and now is "+value);
					}
				}
			  }
		}
		
	}


	computeSquaredNaxes (d, ps) {
        // first aprroximation to be checked
        this._naxis1 =  Math.ceil(d / ps);
        this._naxis2 = this._naxis1;
		this._pxsize = ps;
    }

	setPxsValue(values, fitsHeaderParams) {

		let vidx = 0;
		this._pxvalues = [];
		let pxXTile = HiPSHelper.DEFAULT_Naxis1_2 * HiPSHelper.DEFAULT_Naxis1_2;
		// this._pxvalues.concat(values.slice(vidx * pxXTile, (vidx + 1) * pxXTile ));

		this._tileslist.forEach((tileno) => {

			let tilevalues = values.slice(vidx * pxXTile, (vidx + 1) * pxXTile );
			let minval = tilevalues[0];
			let maxval = tilevalues[0];
			let valuemap = new Array(HiPSHelper.DEFAULT_Naxis1_2);
			for (let j = 0; j < HiPSHelper.DEFAULT_Naxis1_2; j++) {
				valuemap[j] = new Array(HiPSHelper.DEFAULT_Naxis1_2);
				for (let i = 0; i < HiPSHelper.DEFAULT_Naxis1_2; i++) {
					
					valuemap[j][i] = tilevalues[(j * HiPSHelper.DEFAULT_Naxis1_2) + i];

					
					if (valuemap[j][i] < minval || isNaN(minval)) {
						minval = valuemap[j][i];
					} else if (valuemap[j][i] > maxval || isNaN(maxval)) {
						maxval = valuemap[j][i];
					}

				}
			}
			let header = new FITSHeader();
			header.set("NPIX", tileno);
			// TODO CONVERT minval and maxval to physical values!
			header.set("DATAMIN", minval);
			header.set("DATAMAX", maxval);

			this._fitsheaderlist.push(header);
			
			this._pxvalues.push(valuemap);
			vidx += 1;
		});

		this.prepareFITSHeader(fitsHeaderParams);
		return this._pxvalues;

    }
    
	getImageRADecList(center, radius, pxsize) {
	    var self = this;
		let promise = new Promise ( (resolve, reject) => {
			let radeclist = [];
			let phiTheta_rad = HiPSHelper.astroDegToSphericalRad(center.ra, center.dec);
			let ptg = new Pointing(null, false, phiTheta_rad.theta_rad, phiTheta_rad.phi_rad);
			let radius_rad = HiPSHelper.degToRad(radius);
			let rangeset = this._hp.queryDiscInclusive (ptg, radius_rad, 4); // <= check it
			self._tileslist = rangeset.r;
			
	
			self._tileslist.forEach( (tileno) => {
				self._xyGridProj = HiPSHelper.setupByTile(tileno, self._hp);
				for (let i = 0; i < HiPSHelper.pxXtile; i++) {
					for (let j = 0; j < HiPSHelper.pxXtile; j++) {
						let [ra, dec] = self.pix2world(i, j);
						radeclist.push([ra, dec]);
					}
				}
			});
			resolve(radeclist);
		});
		return promise;
		// let radeclist = [];
		// let phiTheta_rad = HiPSHelper.astroDegToSphericalRad(center.ra, center.dec);
		// let ptg = new Pointing(null, false, phiTheta_rad.theta_rad, phiTheta_rad.phi_rad);
		// let radius_rad = HiPSHelper.degToRad(radius);
		// let rangeset = this._hp.queryDiscInclusive (ptg, radius_rad, 4); // <= check it
		// this._tileslist = rangeset.r;
		

		// this._tileslist.forEach( (tileno) => {
		// 	this._xyGridProj = HiPSHelper.setupByTile(tileno, this._hp);
		// 	for (let i = 0; i < HiPSHelper.pxXtile; i++) {
		// 		for (let j = 0; j < HiPSHelper.pxXtile; j++) {
		// 			let [ra, dec] = this.pix2world(i, j);
		// 			radeclist.push([ra, dec]);
		// 		}
		// 	}
		// });
		// return radeclist;

    }
	
	world2pix (radeclist) { 

		let promise = new Promise ( (resolve, reject) => {
			let imgpxlist = [];
			let tileno;
	
			radeclist.forEach(([ra, dec]) => {
				let phiTheta_rad = HiPSHelper.astroDegToSphericalRad(ra, dec);
				let ptg = new Pointing(null, false, phiTheta_rad.theta_rad, phiTheta_rad.phi_rad);
				tileno = this._hp.ang2pix(ptg);
				this._xyGridProj = HiPSHelper.setupByTile(tileno, this._hp);
				
				let rarad =  HiPSHelper.degToRad(ra);
				let decrad = HiPSHelper.degToRad(dec);
				let xy = HiPSHelper.world2intermediate(rarad, decrad);
				let ij = HiPSHelper.intermediate2pix(xy[0], xy[1], this._xyGridProj);
				// TODO don't add duplicates
				imgpxlist.push(new ImagePixel(ij[0], ij[1], tileno));
			
			});
			resolve(imgpxlist);
		});
		return promise;
		

    }
	
	pix2world (i, j) {

        let xy = HiPSHelper.pix2intermediate(i, j, this._xyGridProj, this._naxis1, this._naxis2);
		let raDecDeg = HiPSHelper.intermediate2world(xy[0], xy[1]);

		if (raDecDeg[0] > 360){
			raDecDeg[0] -= 360;
		}

		return raDecDeg;
    }

	getCanvas2d(tfunction = "linear", colormap = "grayscale", inverse = false) {

		let canvaslist = [];
		
		for (let i = 0; i < this._pxvalues.length; i++) {
			let values = this._pxvalues[i];
			let header = this._fitsheaderlist[i];
			let canvas2d =  new Canvas2D(values, header, this, tfunction, colormap, inverse );
			canvaslist.push(canvas2d);
		}

		return canvaslist;
	}
}

export default HiPSProjection;