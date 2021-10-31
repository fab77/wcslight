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


// import Healpix from "healpixjs";
// import { Hploc, Pointing } from "healpixjs";
import HiPSHelper from './HiPSHelper.js';
import ImagePixel from '../model/ImagePixel.js';
import Canvas2D from '../model/Canvas2D.js';
import FITSHeader from '../../../FITSParser/src/FITSHeader.js';
// import { ValidateError } from 'schema-utils';

const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;
const H = 4;
const K = 3;

const healpixResMapK0 = [58.6, 0, 1];
const pxXtile = 512;


class HiPSProjection extends AbstractProjection {



	

    _deltara;//NOT USED
    _deltadec;//NOT USED
    _minra;//NOT USED
    _mindec;//NOT USED
    _stepra;//NOT USED
    _stepdec;//NOT USED
    _np1;//NOT USED
    _np2;//NOT USED
    _scale;//NOT USED

    _fotw;
    _naxis1;
    _naxis2;
    _pixno;
    THETAX;
	MAX_TILES = 20;
	_HIPSResMapK0 = [58.6/pxXtile, 0, 1];
	// _pxsize;
	// _radius;
	_tilesSet;
	_tilesMap;	// used when this projection is used as input projection
	_hp;
    /** 
     * the conversion from RA, Deg to pixel (i, j) goes in this way:
     * convert (RA, Dec) to to intermediate coordinates (X, Y) World2Intermediate
     * convert (X, Y) to pixel coordinates (i, j)
     */ 
    _xyGridProj; // intermediate coordinates in the X, Y plane

	/**
	 * 
	 * @param {*} filelist array of fits URLs
	 */
	constructor (fitsfilepath, hipsURI = null, pxsize = null, order = null) {

		super();
		this._wcsname = "HPX"; // TODO check WCS standard
        this._ctype1 = "RA---HPX";
        this._ctype2 = "DEC--HPX";

        this.THETAX = Hploc.asin( (K - 1)/K );

		if (!fitsfilepath && !hipsURI) {
			throw new Error("One among fitsfilepath and hipsURI must be provided.")
		}
		if (hipsURI && !pxsize && !order) {
			throw new Error("One among pxsize and order must be provided.")
		}

		if (fitsfilepath) {
			this.initFromFile(fitsfilepath);
			
		} else if (pxsize) {
			this.initFromPxsize(pxsize);
		} else {
			this.initFromHiPSOrder(order);
		}
		this._fitsheaderlist = [];

    }

	initFromFile (fitsfilepath) {
		var self = this;
		
		new FITSParser(fitsfilepath).then(fits => {
			
			
	
			this._pxvalues[0] = fits.data;
			this._fitsheaderlist[0] = fits.header;

			let order = fits.header.get("ORDER");
			self.initFromHiPSOrder(order);
			
			self._naxis1 = fits.header.get("NAXIS1");
			self._naxis2 = fits.header.get("NAXIS2");
			self._pixno = fits.header.get("NPIX");
			
			self.setupByTile(self._pixno);
			return {
				"fitsheader": fits.header,
                "fitsdata": fits.data,
                "canvas2d": this.getCanvas2d()
			}
		});
		
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

	setFITSHeaderEntry(key, value) {
		if (this._fh[key] === undefined) {
			this._fh[key] = value;
		}else if (this._fh[key] !== value ) {
			console.error(key+" value "+value+" differs from the original "+this._fh[key]+" pixno "+this._pixno);
			// throw new ValidateError(key+" value "+value+" differs from the original "+this._fh[key]+" pixno "+this._pixno);
		}
	}


	prepareFitsHeader (fitsHeaderParams) {
		for (header of this._fitsheaderlist) {
			this._fitsheader.set("SIMPLE", fitsHeaderParams.get("SIMPLE"));
			this._fitsheader.set("BITPIX", fitsHeaderParams.get("BITPIX"));
			this._fitsheader.set("BLANK", fitsHeaderParams.get("BLANK"));
			this._fitsheader.set("BSCALE", fitsHeaderParams.get("BSCALE"));
			this._fitsheader.set("BZERO", fitsHeaderParams.get("BZERO"));
			this._fitsheader.set("NAXIS", 2);
			this._fitsheader.set("NAXIS1", HiPSHelper.DEFAULT_Naxis1_2);
			this._fitsheader.set("NAXIS2", HiPSHelper.DEFAULT_Naxis1_2);
			
			this._fitsheader.set("CTYPE1", this._ctype1);
			this._fitsheader.set("CTYPE2", this._ctype2);
			
			this._fitsheader.set("CDELT1", this._pxsize); // ??? Pixel spacing along axis 1 ???
			this._fitsheader.set("CDELT2", this._pxsize); // ??? Pixel spacing along axis 2 ???
			this._fitsheader.set("CRPIX1", this._naxis1/2); // central/reference pixel i along naxis1
			this._fitsheader.set("CRPIX2", this._naxis2/2); // central/reference pixel j along naxis2
			
			// this._fitsheader.set("CRVAL1", this._cra); // central/reference pixel RA
        	// this._fitsheader.set("CRVAL2", this._cdec); // central/reference pixel Dec
			
			this._fitsheader.set("ORIGIN", "WCSLight v.0.x");
			this._fitsheader.set("COMMENT", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar");
		}
		return this._fitsheaderlist;
	}

	// getFITSHeaderEntry(key) {
	// 	if (this._fh[key] === undefined) {
	// 		throw new EvalError(key +" not present in FITS Header")
	// 	}
	// 	return this._fh[key];
	// }

	getFITSHeader() {
		return this._fitsheaderlist;
		// return this._fh;
	}

	loadFITS(fitsuri, observerlist) {
		return new FITSParser(fitsuri).then((res) => {
			let fitsdata = res.data;
			let fitsheader = res.header;

			// let fitstileno = fits.header.get("NPIX");
			// this._fitsheaderlist.push(fits.header);
			// TODO group these functions in one method
			// this.setFITSHeaderEntry("SIMPLE", fits.header.simple);
			// this.setFITSHeaderEntry("BLANK", fits.header.blank);
			// this.setFITSHeaderEntry("BZERO", fits.header.bzero);
			// this.setFITSHeaderEntry("BSCALE", fits.header.bscale);

			if (observerlist) {
				for (observer of observerlist) {
					observer.notify(res);
				}
			}
			return res;
		});
	}

	async getPixValues(inputPixelsList) {
	
		// console.warn("Initiating here this._fitsheaderlist. Check if it's the right place!");
		// this._fitsheaderlist = [];

		let tilesset = new Set();
		inputPixelsList.forEach ((imgpx) =>  {
				tilesset.add(imgpx.tileno);
		});

		let pixcount = inputPixelsList.length;
		var values = new Array(pixcount);
		var fitsheaderlist = [];
		var promises = [];

		for (let hipstileno of tilesset) {
			// TODO COMPUTE DirXXX
			let dir = Math.floor(hipstileno/10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
			let fitsurl = this._hipsURI+"/Norder"+this._norder+"/Dir"+dir+"/Npix"+hipstileno+".fits";
			promises.push(new FITSParser(fitsurl).then( (fits) => {

				
				fitsheaderlist.push(fits.header);
				// this._fitsheaderlist.push(fits.header);
				
				// this.setFITSHeaderEntry("SIMPLE", fits.header.get("SIMPLE"));
				// this.setFITSHeaderEntry("BLANK", fits.header.get("BLANK"));
				// this.setFITSHeaderEntry("BZERO", fits.header.get("BZERO"));
				// this.setFITSHeaderEntry("BSCALE", fits.header.get("BSCALE"));
				
				// let naxis1 = fits.header.get("NAXIS1");
				// let naxis2 = fits.header.get("NAXIS2");

				for (let j = 0; j < pixcount; j++ ){
					let imgpx = inputPixelsList[j];
					if (imgpx.tileno === hipstileno) {
						
						values[j] = fits.data[imgpx._j][imgpx._i];
						// let dataidx = (imgpx._j - 1) * naxis1 + imgpx._i;
						// values[j] = fits.data[dataidx];

					}
				}

			}));
			// let fits = new FITSParser(this._hipsURI+"/Norder"+this._norder+"/"+dir+"/Npix"+tileno+".fits");
			// this._fitsheaderlist.push(fits.header);
			// this.setFITSHeaderEntry("SIMPLE", fits.header.simple);
			// this.setFITSHeaderEntry("BLANK", fits.header.blank);
			// this.setFITSHeaderEntry("BZERO", fits.header.bzero);
			// this.setFITSHeaderEntry("BSCALE", fits.header.bscale);

			// for (let j = 0; j < pixcount; j++ ){
			// 	let imgpx = inputPixelsList[j];
			// 	if (imgpx.tileno === hipstileno) {
			// 		values[j] = fits.data[imgpx.j][imgpx.i];
			// 	}
			// }
		}
		// return Promise.all(promises).then( () => { return values});
		await Promise.all(promises);
		this.parseHeaders(fitsheaderlist);
		return values;
	}

	parseHeaders(fitsheaderlist){
		console.log(fitsheaderlist);
		if (!this._fh) {
			this._fh = new FITSHeader;
		}

		for (let i = 0; i< fitsheaderlist.length; i++) {
			let header = fitsheaderlist[i];
			for (const [key, value] of header) {
				// I could add a list of used NPIXs to be included in the comment of the output FITS
				if (["SIMPLE", "BSCALE", "BZERO", "BLANK", "BITPIX", "ORDER", "COMMENT", "CPYRIGH", "ORIGIN"].includes(key)) {
					if (!this._fh.get(key)) {
						this._fh.set(key, value);
					} else if (this._fh.get(key) !== value) { // this should not happen 
						throw new Error("Error parsing headers. "+key+" was "+this._fh.get(key)+" and now is "+value);
					}
				}
			  }
		}
		
	}


	computeSquaredNaxes (d, ps) {
        // first aprroximation to be checked
        this._naxis1 =  Math.ceil(d / ps);
        this._naxis2 = this._naxis1;
    }


	/**
	 * TODO: THIS CAN BE DELETED IN FAVOUR OF setPxsValue
	 * @returns 
	 */
	computePixValues() {
		let data = this._fitsdata;
		let header = this._fitsheaderlist[0];

		this.setFITSHeaderEntry("SIMPLE", header.get("SIMPLE"));
		this.setFITSHeaderEntry("BLANK", header.get("BLANK"));
		this.setFITSHeaderEntry("BZERO", header.get("BZERO"));
		this.setFITSHeaderEntry("BSCALE", header.get("BSCALE"));
		this.setFITSHeaderEntry("NAXIS1", header.get("NAXIS1"));
		this.setFITSHeaderEntry("NAXIS2", header.get("NAXIS2"));
		
		this._pxvalues = data;
		return this._pxvalues;
	}

	setPxsValue(values, fitsHeaderParams) {

		let vidx = 0;
		this._pxvalues = new Array(this._tileslist.length);
		let pxXTile = HiPSHelper.DEFAULT_Naxis1_2 * HiPSHelper.DEFAULT_Naxis1_2;
		// this._pxvalues.concat(values.slice(vidx * pxXTile, (vidx + 1) * pxXTile ));

		this._tileslist.foreach((tileno) => {

			let tilevalues = values.slice(vidx * pxXTile, (vidx + 1) * pxXTile );
			let minval = tilevalues[0];
			let maxval = tilevalues[0];
			let valuemap = new Array(HiPSHelper.DEFAULT_Naxis1_2);
			for (let j = 0; j < HiPSHelper.DEFAULT_Naxis1_2; j++) {
				valuemap[j] = new Array(HiPSHelper.DEFAULT_Naxis1_2);
				for (let i = 0; i < HiPSHelper.DEFAULT_Naxis1_2; i++) {
					valuemap[j][i] = tilevalues[vidx];

					if (values[vidx] < minval) {
						minval = values[vidx];
					} else if (values[vidx] > maxval) {
						maxval = values[vidx];
					}

				}
			}
			let header = new FITSHeader();
			header.set("NPIX", tileno);
			header.set("DATAMIN", minval);
			header.set("DATAMAX", maxval);

			this._fitsheaderlist.push(header);
			this._pxvalues.push(valuemap);
			vidx += 1;
			// parse current header and add it to this._fhlist;
		});

		this.prepareFITSHeader(fitsHeaderParams);
		
		return this._pxvalues;

    }
    
	
	world2pix (radeclist) { 

		let imgpxlist = [];
		let tileno;

		radeclist.forEach(([ra, dec]) => {
			let phiTheta_rad = HiPSHelper.astroDegToSphericalRad(ra, dec);
			let ptg = new Pointing(null, false, phiTheta_rad.theta_rad, phiTheta_rad.phi_rad);
			tileno = this._hp.ang2pix(ptg);
			this.setupByTile(tileno);
			
			let rarad =  HiPSHelper.degToRad(ra);
			let decrad = HiPSHelper.degToRad(dec);
			let xy = this.world2intermediate(rarad, decrad);
			let ij = this.intermediate2pix(xy[0], xy[1]);
			// TODO don't add duplicates
			imgpxlist.push(new ImagePixel(ij[0], ij[1], tileno));
		
		});
		return imgpxlist;

    }

	

	getImageRADecList(center, radius, pxsize) {
	    
		let radeclist = [];
		let phiTheta_rad = HiPSHelper.astroDegToSphericalRad(center.raDeg, center.decDeg);
		let ptg = new Pointing(null, false, phiTheta_rad.theta_rad, phiTheta_rad.phi_rad);
		let radius_rad = HiPSHelper.degToRad(radius);
		let rangeset = this._hp.queryDiscInclusive (ptg, radius_rad, 4); // <= check it
		this._tileslist = rangeset.r;
		

		this._tileslist.foreach( (tileno) => {
			this.setupByTile(tileno);
			for (let i = 0; i < HiPSHelper.pxXtile; i++) {
				for (let j = 0; j < HiPSHelper.pxXtile; j++) {
					let [ra, dec] = this.pix2world(i, j);
					radeclist.add(ra, dec);
				}
			}
		});
		return radeclist;
		// TODO[Yago] DONE
		/* 
		let radeclist = [];
		this._tileslist = hp.queryinclusive (center, radius);
		this._tileslist.foreach(tileno => {
			 this.setupByTileno(tileno)
			 iterate over i,j 512x512 this._naxis[1-2]
			 	[ra, dec] = pix2word(i, j);
			 	radeclist.add(ra, dec)
		})
		*/
		// TODO replace the below with the above
    	

    }

	setupByTile(tileno) {

        this._xyGridProj = {
			"min_y": NaN,
			"max_y": NaN,
			"min_x": NaN,
			"max_x": NaN,
			"gridPointsDeg": []
		}
		if (isNaN(this._nside)){
			throw new EvalError("nside not set");
		}

		let cornersVec3 = this._hp.getBoundariesWithStep(tileno, 1);
		let pointings = [];
		
		for (let i = 0; i < cornersVec3.length; i++) {
			pointings[i] = new Pointing(cornersVec3[i]);
			if (i >= 1){
                let a = pointings[i-1].phi;
                let b = pointings[i].phi;
                // case when RA is just crossing the origin (e.g. 357deg - 3deg)
                if (Math.abs(a - b) > Math.PI) {
                    if (pointings[i-1].phi < pointings[i].phi) {
                        pointings[i-1].phi += 2 * Math.PI;
                    }else{
                        pointings[i].phi += 2 * Math.PI;
                    }
                }    
            }
		}

		for (let j = 0; j < pointings.length; j++) {
			let coThetaRad = pointings[j].theta;
            // HEALPix works with colatitude (0 North Pole, 180 South Pole)
            // converting the colatitude in latitude (dec)
			let decRad = Math.PI/2 - coThetaRad;

			let raRad = pointings[j].phi;
			
			// projection on healpix grid
			let xyDeg = this.world2intermediate(raRad, decRad);
			this._xyGridProj.gridPointsDeg[j * 2] = xyDeg[0];
			this._xyGridProj.gridPointsDeg[j * 2 + 1] = xyDeg[1];

			if (isNaN(this._xyGridProj.max_y) || xyDeg[1] > this._xyGridProj.max_y ) {
				this._xyGridProj.max_y = xyDeg[1];
			}
			if (isNaN(this._xyGridProj.min_y) || xyDeg[1] < this._xyGridProj.min_y) {
				this._xyGridProj.min_y = xyDeg[1];
			}
			if (isNaN(this._xyGridProj.max_x) || xyDeg[0] > this._xyGridProj.max_x) {
				this._xyGridProj.max_x = xyDeg[0];
			}
			if (isNaN(this._xyGridProj.min_x) || xyDeg[0] < this._xyGridProj.min_x) {
				this._xyGridProj.min_x = xyDeg[0];
			}

		}
    }
    
    /**
     * Projection of the World coordinates into the intermediate coordinates plane (Paper .....)
     * @param {*} phiRad 
     * @param {*} thetaRad 
     * @returns 
     */
     world2intermediate(phiRad, thetaRad) {
        let x_grid, y_grid;

		if ( Math.abs(thetaRad) <= this.THETAX) { // equatorial belts
			x_grid = phiRad * RAD2DEG;
			
			y_grid = Hploc.sin(thetaRad) * K * 90 / H;
			

		} else if ( Math.abs(thetaRad) > this.THETAX) { // polar zones

			let phiDeg = phiRad  * RAD2DEG;

			let w = 0; // omega
			if (K % 2 !== 0 || thetaRad > 0) { // K odd or thetax > 0
				w = 1;
			}

			let sigma = Math.sqrt( K * (1 - Math.abs(Hploc.sin(thetaRad)) ) );
			let phi_c = - 180 + ( 2 * Math.floor( ((phiRad + 180) * H/360) + ((1 - w)/2) ) + w ) * ( 180 / H );
			
			x_grid = phi_c + (phiDeg - phi_c) * sigma;
			y_grid = (180  / H) * ( ((K + 1)/2) - sigma);

			if (thetaRad < 0) {
				y_grid *= -1;
			}
		}

		return [x_grid, y_grid];

    }

    intermediate2pix(x, y) {
        let xInterval = Math.abs(this._xyGridProj.max_x - this._xyGridProj.min_x);
		let yInterval = Math.abs(this._xyGridProj.max_y - this._xyGridProj.min_y);

		let i_norm, j_norm;
		if ( (this._xyGridProj.min_x > 360 || this._xyGridProj.max_x > 360) && x < this._xyGridProj.min_x) {
			i_norm = (x + 360 - this._xyGridProj.min_x) / xInterval;	
		}else {
			i_norm = (x - this._xyGridProj.min_x) / xInterval;
		}
		j_norm = (y - this._xyGridProj.min_y) / yInterval;
		
		let i = 0.5 - (i_norm - j_norm);
		let j = (i_norm + j_norm) - 0.5;
		i = Math.floor(i * HiPSHelper.pxXtile);
		j = Math.floor(j * HiPSHelper.pxXtile) + 1;
		return [i , j];

    }


	pix2world (i, j) {

        let xy = this.pix2intermediate(i, j);
		let raDecDeg = this.intermediate2world(xy[0], xy[1]);

		if (raDecDeg[0] > 360){
			raDecDeg[0] -= 360;
		}

		return raDecDeg;
    }

    pix2intermediate (i, j) {
        /**
	 	 * (i_norm,w_pixel) = (0,0) correspond to the lower-left corner of the facet in the image
		 * (i_norm,w_pixel) = (1,1) is the upper right corner
		 * dimamond in figure 1 from "Mapping on the HEalpix grid" paper
		 * (0,0) leftmost corner
		 * (1,0) upper corner
		 * (0,1) lowest corner
		 * (1,1) rightmost corner
		 * Thanks YAGO! :p
		 */
        let i_norm = (i + 0.5) / this._naxis1;
		let j_norm = (j + 0.5) / this._naxis2;

        let xInterval = Math.abs(this._xyGridProj.max_x - this._xyGridProj.min_x) / 2.0;
		let yInterval = Math.abs(this._xyGridProj.max_y - this._xyGridProj.min_y) / 2.0;
		let yMean = (this._xyGridProj.max_y + this._xyGridProj.min_y) / 2.0;

        // bi-linear interpolation
		let x = this._xyGridProj.max_x - xInterval * (i_norm + j_norm);
		let y = yMean - yInterval * (j_norm - i_norm);
		
        return [x, y];
    }


    intermediate2world(x, y) {

        let phiDeg, thetaDeg;
		let Yx = 90 * (K - 1) / H;

		

		if (Math.abs(y) <= Yx) { // equatorial belts

			phiDeg = x;
			thetaDeg = Math.asin( (y  * H) / (90 * K)) * RAD2DEG;

		} else if (Math.abs(y) > Yx) { // polar regions

			let sigma = (K + 1) / 2 - Math.abs(y * H) / 180;
			let w = 0; // omega
			if (K % 2 !== 0 || thetaRad > 0) { // K odd or thetax > 0
				w = 1;
			}
			let x_c = -180 + ( 2 * Math.floor((x + 180) * H/360 + (1 - w) /2  ) + w) * (180 / H);
			phiDeg = x_c + ( x - x_c) / sigma;
			let thetaRad = Hploc.asin( 1 - (sigma * sigma) / K );
			thetaDeg = thetaRad * RAD2DEG;
			if (y <= 0){
				thetaDeg *= -1;
			}
		}
		return [phiDeg, thetaDeg];

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