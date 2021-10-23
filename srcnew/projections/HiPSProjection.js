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
import {Hploc, Vec3, Pointing} from "healpixjs";
import Healpix from "healpixjs";
import TilesMap from '../model/TilesMap';
import HiPSHelper from './HiPSHelper';
import ImagePixel from '../model/ImagePixel';
import Canvas2D from '../model/Canvas2D';
import { ValidateError } from 'schema-utils';

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
	constructor (fitsFilelist, hipsURI = null, pxsize = null) {

		super();
        this.THETAX = Hploc.asin( (K - 1)/K );
		if (fitsFilelist) {
			this._fitsFilelist = fitsFilelist;
			if (this._fitsFilelist.length >= 1) {
				this.initFromFile(0);
			}
		} else if (hipsURI && pxsize) {
			this._hipsURI = hipsURI;
			this.initFromPxsize(pxsize);
		}
		this._fitsheaderlist = [];

    }

	initFromFile (fitsIndex) {
		let fitsURL = this._fitsFilelist[fitsIndex];
		let fits = new FITSParser(fitsURL);
		this._fitsdata = fits.data;
		this._fitsheaderlist.push(fits.header);

		let order = fits.header.order;
		this.initFromHiPSOrder(order);
		
		this._naxis1 = fits.header.naxis1;
		this._naxis2 = fits.header.naxis2;
		this._pixno = fits.header.npix;
		
		this.setupByTile(this._pixno);
	}

	initFromPxsize (pxsize) {
		let hipsorder = HiPSHelper.computeNside(pxsize);
		this.initFromHiPSOrder(hipsorder);
	}

	initFromHiPSOrder (hipsorder) {
		this._norder = hipsorder;
		this._nside = 2**hipsorder;
		this._hp = new Healpix(nside);
	}

	getFITSHeaders () {
		return this._fitsheaderlist;
	}

	prepareFITSHeader () {
		// TODO
		// let fitsheader = new FITSHeader();
		// fitsheader.set("NAXIS1", this._naxis1);
		// fitsheader.set("NAXIS2", this._naxis2);
		// fitsheader.set("ORDER", this._norder);
		// fitsheader.set("NPIX", this._pixno);
		// fitsheader.set("BLANK", this._fitsheaderlist[0].get("BLANK"));
		// fitsheader.set("BSCALE", this._fitsheaderlist[0].get("BSCALE"));
		// fitsheader.set("BZERO", this._fitsheaderlist[0].get("BZERO"));
		// fitsheader.set("CTYPE1", "HiPS");
		// fitsheader.set("CTYPE2", "HiPS");

        // fitsheader.set("CDELT1", ); // ??? Pixel spacing along axis 1 ???
        // fitsheader.set("CDELT2", ); // ??? Pixel spacing along axis 2 ???
        // fitsheader.set("CRPIX1", this._naxis1/2); // central/reference pixel i along naxis1
        // fitsheader.set("CRPIX2", this._naxis2/2); // central/reference pixel j along naxis2
        // fitsheader.set("CRVAL1", ); // central/reference pixel RA
        // fitsheader.set("CRVAL2", ); // central/reference pixel Dec
        // fitsheader.set("WCSNAME", "HiPS");
        // fitsheader.set("ORIGIN", "WCSLight v.0.x");
        // fitsheader.set("COMMENT", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar");

		// for (let hsidx = 1; hsidx < this._fitsheaderlist.length; hsidx++) {
		// 	let cheader = this._fitsheaderlist[hsidx];
		// 	if ( cheader.get("BSCALE") !== fitsheader.get("BSCALE")) {
		// 		throw new ValidateError("BSCALE value has changed");
		// 	}

		// 	if ( cheader.get("BLANK") !== fitsheader.get("BLANK")) {
		// 		throw new ValidateError("BLANK value has changed");
		// 	}

		// 	if ( cheader.get("BZERO") !== fitsheader.get("BZERO")) {
		// 		throw new ValidateError("BZERO value has changed");
		// 	}
		// }

		// return fitsheader;
		
	}

	setFITSHeaderEntry(key, value) {
		if (this._fh[key] === undefined) {
			this._fh[key] = value;
		}else if (this._fh[key] !== value ) {
			throw new ValidateError(key+" value "+value+" differs from the original "+this._fh[key]+" pixno "+this._pixno);
		}
	}

	getFITSHeaderEntry(key) {
		if (this._fh[key] === undefined) {
			throw new EvalError(key +" not present in FITS Header")
		}
		return this._fh[key];
	}

	getFITSHeader() {
		return this._fh;
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
		
		this._pxvalues = new Map();
		let values = new Array(this._naxis2);
		for (let j = 0; j < this._naxis2; j++ ){
			if (!values[j]) {
				values[j] = new Array(this._naxis1);
			}
			for (let i = 0; i < this._naxis1; i++ ){
				values[j][i] = data[j][i];		
			}
		}
		this._pxvalues.set(this._pixno, values);
		// this._pxvalues = values;
		return values;
	}

	getPixValuesFromPxlist(inputPixelsList) {

		let tilesset = new Set();
		inputPixelsList.forEach ((imgpx) => function () {
				tilesset.add(imgpx.tileno);
		});

		let pixcount = inputPixelsList.length;
		let values = new Array(pixcount);

		if (this._fitsFilelist.length >= 1) { // case when the input is a list of files
			for (let i = 0; i < this._fitsFilelist.length; i++) {
				let fits = new FITSParser(this._fitsFilelist[i]);
				let fitstileno = fits.header.npix;
				this._fitsheaderlist.push(fits.header);
				// TODO group these functions in one method
				this.setFITSHeaderEntry("SIMPLE", fits.header.simple);
				this.setFITSHeaderEntry("BLANK", fits.header.blank);
				this.setFITSHeaderEntry("BZERO", fits.header.bzero);
				this.setFITSHeaderEntry("BSCALE", fits.header.bscale);

				for (let j = 0; j < pixcount; j++ ){
					let imgpx = inputPixelsList[j];
					if (imgpx.tileno === fitstileno) {
						values[j] = fits.data[imgpx.j][imgpx.i];
					}
				}
			}
		} else { // case when the input is a base HiPS URI
			for (let hipstileno of tilesset) {
				// TODO COMPUTE DirXXX
				console.warn("// TODO COMPUTE DirXXX");
				let fits = new FITSParser(this._hipsURI+"/Norder"+this._norder+"/DirXXX/Npix"+tileno+".fits");
				this._fitsheaderlist.push(fits.header);
				this.setFITSHeaderEntry("SIMPLE", fits.header.simple);
				this.setFITSHeaderEntry("BLANK", fits.header.blank);
				this.setFITSHeaderEntry("BZERO", fits.header.bzero);
				this.setFITSHeaderEntry("BSCALE", fits.header.bscale);

				for (let j = 0; j < pixcount; j++ ){
					let imgpx = inputPixelsList[j];
					if (imgpx.tileno === hipstileno) {
						values[j] = fits.data[imgpx.j][imgpx.i];
					}
				}
			}
		}
		return values;
	}


	computeSquaredNaxes (d, ps) {
        // first aprroximation to be checked
        this._naxis1 =  Math.ceil(d / ps);
        this._naxis2 = this._naxis1;
    }

	setPxsValue(values, fitsHeaderParams, tileno) {
        
		this._pxvalues = new Map();
		

		// TODO
        this._minval = values[0];
        this._maxval = values[0];
        let currvalues = new Array(this._naxis2);  
        let vidx = 0;

        for (let j = 0; j < this._naxis2; j++) {
            
			currvalues[j] = new Array(this._naxis1);
            
			for (let i = 0; i < this._naxis1; i++) {
            
				currvalues[j][i] = values[vidx];
            
				if (values[vidx] < this._minval) {
                    this._minval = values[vidx];
                } else if (values[vidx] < this._maxval) {
                    this._maxval = values[vidx];
                }
                vidx += 1;
            }
        }
		this._pxvalues.set(tileno, currvalues);
        this.prepareFITSHeader(fitsHeaderParams);
        return this._pxvalues;

    }
    /**
     * 
     * @param {*} radeg 
     * @param {*} decdeg
     *  
     */
	//  world2pix (radeg, decdeg, tileno) {
	world2pix (radeclist) { // or list of [ra, dec]

		let imgpxlist = [];

		// TODO this._hp is NOT set at this point!!! It must be!
		radeclist.forEach((ra, dec) => function () {
			let phiTheta_rad = HiPSHelper.astroDegToSphericalRad(ra, dec);
			let ptg = new Pointing(null, false, phiTheta_rad.theta_rad, phiTheta_rad.phi_rad);
			let tileno = this._hp.ang2pix(ptg);
			this.setupByTile(tileno);
			let phirad = radeg * DEG2RAD;
			let thetarad = decdeg * DEG2RAD;
			let xy = this.world2intermediate(phirad, thetarad);
			let ij = this.intermediate2pix(xy[0], xy[1]);
			imgpxlist.push(new ImagePixel(ij[0], ij[1], tileno));
		
		});
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
        
		// let bbox = [[this._minra, this._mindec], 
		// 			[this._minra, center.decDeg + radius], 
		// 			[center.raDeg + radius, center.decDeg + radius], 
		// 			[center.raDeg + radius, this._mindec]];

		// let points = [];
		// for (let i = 0; i < bbox.length; i++) {
		// 	let phiTheta_rad =HiPSHelper.astroDegToSphericalRad(this._minra, this._mindec);	
		// 	let pointing = new Pointing(null, false, phiTheta_rad.theta, phiTheta_rad.phi);
		// 	points.push(pointing);
		// }			
		// let rangeset = this._hp.queryPolygonInclusive(points, 32); // returns int array
		// let tilelist = rangeset.r;
		// tilelist.foreach((tile) => function(){
		// 	let cornersVec3 = this._hp.getBoundariesWithStep(this._pixno, 1);

		// });


        let radeclist = new Map();
		for (let cra = this._minra; cra < (this._pxsize * this._naxis1); cra += this._pxsize) {
            for (let cdec = this._mindec; cdec < (this._pxsize * this._naxis2); cdec += this._pxsize) {
				
				let phiTheta_rad = HiPSHelper.astroDegToSphericalRad(cra, cdec);	
				let ptg = new Pointing(null, false, phiTheta_rad.theta, phiTheta_rad.phi);
				let tileno = this._hp.ang2pix(ptg);
				if (!radeclist.has(tileno)) {
					radeclist.set(tileno, []);
				}
				radeclist.get(tileno).push([cra, cdec]);
                // radeclist.push([cra, cdec]);
            }
        }

		
		return radeclist;


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
		i = Math.floor(i * 512);
		j = Math.floor(j * 512) + 1;
		return [i , j];

    }


	pix2world (i, j) {
        let result = {
            "skyCoords": [],
			"xyCoords": []
        };

        let xy = this.pix2intermediate(i, j);
		let raDecDeg = this.intermediate2world(xy[0], xy[1]);

		if (raDecDeg[0] > 360){
			raDecDeg[0] -= 360;
		}

        result.xyCoords = xy;
        result.skyCoords = raDecDeg;

        return result;

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

		// let pxmatrix = new Array(this._naxis2);
		// let k = 0;
		// for (let j = 0; j < this._naxis2; j++) {
		// 	if (!pxmatrix[j]) {
		// 		pxmatrix[j] = new Array(this._naxis1);
		// 	}
		// 	for (let i = 0; i < this._naxis1; i++) {
		// 		pxmatrix[j][i] = this._pxvalues[k];
		// 		k+=1;
		// 	}
		// }
        let canvaslist = [];
		for (const [key, value] of this._pxvalues) {
			let canvas2d =  new Canvas2D(value, this, tfunction, colormap, inverse);
			canvaslist.push(canvas2d);
		}

		
		return canvaslist;
	}
}

export default HiPSProjection;