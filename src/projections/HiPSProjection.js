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
import FITSHeaderItem from '../../../FITSParser/src/FITSHeaderItem.js';
import ParseUtils from '../../../FITSParser/src/ParseUtils.js';



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

		this._fitsheaderlist = [];

		if (fitsfilepath) {
			return this.initFromFile(fitsfilepath);
		} else if (pxsize !== null && pxsize !== undefined) {
			this._hipsURI = hipsURI;
			this.initFromPxsize(pxsize);
		} else {
			this._hipsURI = hipsURI;
			this._pxsize = HiPSHelper.computePxSize(order);
			this.initFromHiPSOrder(order);
		}
		

    }

	async initFromFile (fitsfilepath) {
		var self = this;
		
		let promise = new FITSParser(fitsfilepath).then(fits => {
			
			
			this._pxvalues = [];
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
                "canvas2d": self.getCanvas2d()[0]
			}
		});
		await promise;
		return promise;
	}

	initFromPxsize (pxsize) {
		this._pxsize = pxsize;
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
			
			header.addItemAtTheBeginning(new FITSHeaderItem("BITPIX", fitsHeaderParams.get("BITPIX")));
			header.addItemAtTheBeginning(new FITSHeaderItem("SIMPLE", fitsHeaderParams.get("SIMPLE")));

			if (fitsHeaderParams.get("BLANK") !== undefined) {
				header.addItem(new FITSHeaderItem("BLANK", fitsHeaderParams.get("BLANK")));
			}
			let bscale = 1.0;
			if (fitsHeaderParams.get("BSCALE") !== undefined) {
				bscale = fitsHeaderParams.get("BSCALE");
			} 
			header.addItem(new FITSHeaderItem("BSCALE", bscale));

			let bzero = 0.0;
			if (fitsHeaderParams.get("BZERO") !== undefined) {
				bzero = fitsHeaderParams.get("BZERO");
			} 
			header.addItem(new FITSHeaderItem("BZERO", bzero));
			header.addItem(new FITSHeaderItem("NAXIS", 2));
			header.addItem(new FITSHeaderItem("NAXIS1", HiPSHelper.DEFAULT_Naxis1_2));
			header.addItem(new FITSHeaderItem("NAXIS2", HiPSHelper.DEFAULT_Naxis1_2));

			header.addItem(new FITSHeaderItem("ORDER", this._norder));
			
			// header.addItem(new FITSHeaderItem("CTYPE1", this._ctype1));
			// header.addItem(new FITSHeaderItem("CTYPE2", this._ctype2));
			// 0.000447222222222
			let pxsize = HiPSHelper.computePxSize(this._norder);
			header.addItem(new FITSHeaderItem("CDELT1", pxsize)); // ??? Pixel spacing along axis 1
			header.addItem(new FITSHeaderItem("CDELT2", pxsize)); // ??? Pixel spacing along axis 2 
			header.addItem(new FITSHeaderItem("CRPIX1", HiPSHelper.DEFAULT_Naxis1_2/2)); // central/reference pixel i along naxis1
			header.addItem(new FITSHeaderItem("CRPIX2", HiPSHelper.DEFAULT_Naxis1_2/2)); // central/reference pixel j along naxis2
			
			header.addItem(new FITSHeaderItem("ORIGIN", "WCSLight v.0.x"));
			header.addItem(new FITSHeaderItem("COMMENT", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar"));

		}
		return this._fitsheaderlist;
	}


	getFITSHeader() {
		return this._fitsheaderlist;
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
		// var values = new Array(pixcount);
		var values = undefined;
		var fitsheaderlist = [];
		var promises = [];

		for (let hipstileno of tilesset) {
			
			let dir = Math.floor(hipstileno/10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
			let fitsurl = this._hipsURI+"/Norder"+this._norder+"/Dir"+dir+"/Npix"+hipstileno+".fits";
			console.log("Loading "+fitsurl);
			promises.push(new FITSParser(fitsurl).then( (fits) => {
	
				if (fits === undefined) {
					console.error("tileno "+hipstileno +" data not loaded");
					console.log(fitsurl+" not found");
					fitsheaderlist.push(undefined);
				} else {


					let bytesXelem = Math.abs(fits.header.get("BITPIX") / 8);
					let blankBytes = ParseUtils.convertBlankToBytes(fits.header.get("BLANK"), bytesXelem); // => ???????
					if (values === undefined) {
						values = new Uint8Array(pixcount * bytesXelem);
					}
					
					console.log(fitsurl+" loaded");
					fitsheaderlist.push(fits.header);
			
					for (let p = 0; p < pixcount; p++ ){
						let imgpx = inputPixelsList[p];
	
						if (imgpx.tileno === hipstileno) {

							if (imgpx._j < HiPSHelper.DEFAULT_Naxis1_2 && imgpx._i < HiPSHelper.DEFAULT_Naxis1_2){
								for (let b = 0; b < bytesXelem; b++) {
									values[p * bytesXelem + b] = fits.data[imgpx._j][imgpx._i * bytesXelem  + b];
								}
							}
						}
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
			if (header !== undefined){

				for (let item of header.getItemList()) {
					if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER"].includes(item.key)) {
						if (!this._fh_common.getItemListOf(item.key)[0]) {
							this._fh_common.addItem(new FITSHeaderItem(item.key, item.value, null));
						} else if (this._fh_common.getItemListOf(item.key)[0].value !== item.value) { // this should not happen 
							throw new Error("Error parsing headers. "+item.key+" was "+this._fh_common.getItemListOf(item.key)[0]+" and now is "+item.value);
						}
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

	// TODO MOVE THIS IN AN UTILITY FILE
	pixel2Physical(value, bzero, bscale){
        let pval = bzero + bscale * value;
        return pval;
    }

	setPxsValue(values, fitsHeaderParams) {

		let vidx = 0; // <------ ERROR!!!!! pixel are not organized by tile!!!
		this._pxvalues = [];
		let pxXTile = HiPSHelper.DEFAULT_Naxis1_2 * HiPSHelper.DEFAULT_Naxis1_2;
		let bytesXelem = Math.abs(fitsHeaderParams.get("BITPIX") / 8);
		let bscale = (fitsHeaderParams.get("BSCALE") !== undefined) ? fitsHeaderParams.get("BSCALE") : 1.0;
        let bzero = (fitsHeaderParams.get("BZERO") !== undefined) ? fitsHeaderParams.get("BZERO") : 0.0;

		let minmaxmap =  {};
		// this._pxvalues = new Array(this._tileslist.length);
		this._pxvalues = {};
		this._tileslist.forEach((tileno) => {
			// this._pxvalues[""+tileno+""] = new Uint8Array(pxXtile * bytesXelem);	// unidimensional
			this._pxvalues[""+tileno+""] = new Array(HiPSHelper.DEFAULT_Naxis1_2);  // <- bidimensional
			for (let row = 0; row < HiPSHelper.DEFAULT_Naxis1_2; row++) {
				this._pxvalues[""+tileno+""][row] = new Uint8Array(HiPSHelper.DEFAULT_Naxis1_2 * bytesXelem);
			}
			// this._pxvalues[""+tileno+""].forEach( (row) => {
			// 	this._pxvalues[""+tileno+""][row] = new Uint8Array(HiPSHelper.DEFAULT_Naxis1_2 * bytesXelem);
			// });
			minmaxmap[""+tileno+""] = new Array(2);
		});
		let ra, dec;
		let col, row;
		// let imgpxlist, imgpx;
		for (let rdidx = 0; rdidx < this._radeclist.length; rdidx++) {
			[ra, dec] = this._radeclist[rdidx];
			let phiTheta_rad = HiPSHelper.astroDegToSphericalRad(ra, dec);
			let ptg = new Pointing(null, false, phiTheta_rad.theta_rad, phiTheta_rad.phi_rad);
			let pixtileno = this._hp.ang2pix(ptg);

			let xyGridProj = HiPSHelper.setupByTile(pixtileno, this._hp);
			let rarad =  HiPSHelper.degToRad(ra);
			let decrad = HiPSHelper.degToRad(dec);
			let xy = HiPSHelper.world2intermediate(rarad, decrad);
			let ij = HiPSHelper.intermediate2pix(xy[0], xy[1], xyGridProj);
			col = ij[0];
			row = ij[1];

			for (let b = 0; b < bytesXelem; b++){
				let byte = values[rdidx * bytesXelem + b];
				// this._pxvalues[""+tileno+""][row * bytesXelem + col + b] = byte;	// unidimensional
				if (this._pxvalues[""+pixtileno+""] === undefined || 
				this._pxvalues[""+pixtileno+""][row] === undefined ||
				this._pxvalues[""+pixtileno+""][row][col * bytesXelem + b] === undefined) {
					console.log("STOP!");
				}
				this._pxvalues[""+pixtileno+""][row][col * bytesXelem + b] = byte	// <- bidimensional
			}
			let min = minmaxmap[""+pixtileno+""][0];
			let max = minmaxmap[""+pixtileno+""][1];

			let valpixb = ParseUtils.extractPixelValue(0, this._pxvalues[""+pixtileno+""][row].slice(col, col + bytesXelem), fitsHeaderParams.get("BITPIX"));
			let valphysical = bzero + bscale * valpixb;
			if (valphysical < min || isNaN(min)) {
				// min = valphysical;
				minmaxmap[""+pixtileno+""][0] = valphysical;
			} else if (valphysical > max || isNaN(max)) {
				// max = valphysical;
				minmaxmap[""+pixtileno+""][1] = valphysical;
			}

		}


		Object.keys(this._pxvalues).forEach((tileno) => {
			tileno = parseInt(tileno);
			let header = new FITSHeader();
			header.set("NPIX", tileno);
			// TODO CONVERT minval and maxval to physical values!
			header.addItem(new FITSHeaderItem("DATAMIN", minmaxmap[""+tileno+""][0]));
			header.addItem(new FITSHeaderItem("DATAMAX", minmaxmap[""+tileno+""][1]));
			header.addItem(new FITSHeaderItem("NPIX", tileno));
			
			let vec3 = this._hp.pix2vec(tileno);
			let ptg = new Pointing(vec3);
			let crval1 = HiPSHelper.radToDeg(ptg.phi);
			let crval2 = 90 - HiPSHelper.radToDeg(ptg.theta);
			
			header.addItem(new FITSHeaderItem("CRVAL1", crval1));
			header.addItem(new FITSHeaderItem("CRVAL2", crval2));
	
			this._fitsheaderlist.push(header);
		});
		




		this.prepareFITSHeader(fitsHeaderParams);
		return this._pxvalues;

    }
    
	getImageRADecList(center, radius, pxsize) {
		this._radeclist = [];
		let promise = new Promise ( (resolve, reject) => {
			//let radeclist = [];
			let phiTheta_rad = HiPSHelper.astroDegToSphericalRad(center.ra, center.dec);
			let ptg = new Pointing(null, false, phiTheta_rad.theta_rad, phiTheta_rad.phi_rad);
			let radius_rad = HiPSHelper.degToRad(radius);

			// with fact 8 the original Java code starts returning the the ptg pixel. with my JS porting only from fact 16
			let rangeset = this._hp.queryDiscInclusive (ptg, radius_rad, 4); // <= check it 
			
			// this._tileslist = rangeset.r;
			this._tileslist = [];
			for ( let p = 0; p < rangeset.r.length; p++) {

				if (!this._tileslist.includes(rangeset.r[p]) && rangeset.r[p]!= 0){
					this._tileslist.push(rangeset.r[p]);
				}

			}

			let cpix = this._hp.ang2pix(ptg);
			if (!this._tileslist.includes(cpix)) {
				this._tileslist.push(cpix);
			}
			
			
			let minra = center.ra - radius;
			let maxra = center.ra + radius;
			let mindec = center.dec - radius;
			let maxdec = center.dec + radius;

			this._tileslist.forEach( (tileno) => {
				this._xyGridProj = HiPSHelper.setupByTile(tileno, this._hp);
				for (let j = 0; j < HiPSHelper.DEFAULT_Naxis1_2; j++) {
					for (let i = 0; i < HiPSHelper.DEFAULT_Naxis1_2; i++) {
						let [ra, dec] = this.pix2world(i, j);
						if ( ra < minra || ra > maxra ||
							dec < mindec || dec > maxdec) {
								continue;
						} 
						this._radeclist.push([ra, dec]);
					}
				}
			});
			resolve(this._radeclist);
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
			let prevTileno = undefined;
			let p = 0;
			radeclist.forEach(([ra, dec]) => {
				let phiTheta_rad = HiPSHelper.astroDegToSphericalRad(ra, dec);
				let ptg = new Pointing(null, false, phiTheta_rad.theta_rad, phiTheta_rad.phi_rad);
				
				tileno = this._hp.ang2pix(ptg);
				if (prevTileno !== tileno || prevTileno === undefined){
					this._xyGridProj = HiPSHelper.setupByTile(tileno, this._hp);
					prevTileno = tileno;
				}
				if (p == 79800) {
					console.log("STOP!");
				}
				let rarad =  HiPSHelper.degToRad(ra);
				let decrad = HiPSHelper.degToRad(dec);
				let xy = HiPSHelper.world2intermediate(rarad, decrad);
				let ij = HiPSHelper.intermediate2pix(xy[0], xy[1], this._xyGridProj);
				
				imgpxlist.push(new ImagePixel(ij[0], ij[1], tileno));
				
				p++;
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