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
	 * @param {*} center {ra, dec} in decimal degrees
	 * @param {*} radius decimal degrees
	 * @param {*} pxsize decimal degrees
	 */
	//  constructor (center, radius, pxsize) {
	constructor () {
        
		super();
        this.THETAX = Hploc.asin( (K - 1)/K );
		// moved to init
		// this._nside = this.computeNside(pxsize);
		// this._hp = new Healpix(this._nside);
		// let phiTheta_rad = this.convert2PhiTheta(center);
		// let bbox = this.computeBbox(phiTheta_rad, this.degToRad(radius));
		// this._tilesSet = hp.queryPolygonInclusive(bbox, 32);
		
    }

	/**
	 * 
	 * @param {*} initparam 
	 */
	init(initparam) {

		if ( initparam.action === "canvas2d" || initparam.action === "transform_in" ) {
			// initiparam = {nside, tileno, naxis1, naxis2}
			let nside = initparam.nside;
			this._naxis1 = initparam.naxis1;
			this._naxis2 = initparam.naxis2;
			this._pixno = initparam.tileno;
			this._hp = new Healpix(nside);
			this.setupByTile(this._pixno);
		} else if (initparam.action === "cutout" ) {
			// initiparam = {center, radius, pxsize}
			let nside = this.computeNside(initparam.pxsize);
			let phiTheta_rad = this.convert2PhiTheta(initparam.center);
			let bbox = this.computeBbox(phiTheta_rad, this.degToRad(initparam.radius));
			this._hp = new Healpix(nside);
			this._tilesSet = hp.queryPolygonInclusive(bbox, 32);

		} else if (initparam.action === "transform_out" ) {
			// initiparam = {bbox, naxis1, naxis2, pxsize}
			let bbox = initparam.bbox;
			this._tilesSet = hp.queryPolygonInclusive(bbox, 32);
			let nside = this.computeNside(initparam.pxsize);
			this._hp = new Healpix(nside);
		}

	}

	/**
	 * Table 1 - ref paper HEALPix — a Framework for High Resolution Discretization,
	 * and Fast Analysis of Data Distributed on the Sphere
	 * K. M. G´orski1,2, E. Hivon3,4, A. J. Banday5, B. D. Wandelt6,7, F. K. Hansen8, M.
	 * Reinecke5, M. Bartelman9
	 */
	/**
	 * 
	 * @param {decimal degrees} pxsize 
	 * @returns {int} nside
	 */
	computeNside(pxsize){
		/**
		 * with same order k (table 1), HIPS angular resolution is higher of order of 512 (2^9) pixels than 
		 * the HEALPix. This is because each tile in a HiPS is represented by default by 512x512 pixels.\
		 * Angular resolution of different HEALPix orders in respect to the order 0, can be calculated this
		 * way:
		 * 
		 * 	L(k) = L(0) / 2^k = 58.6 / 2^k
		 * 
		 * Therefore, in the case of HiPS we need to take into account the extra resolution given by the 
		 * 512x512 (2^9) tiles. In this case the above becomes:
		 * 	
		 * 	L(k) = L(0) / (2^k * 2^9) 
		 * 
		 * Though, in order to compute the required order starting from the pxsize desired (in input) we
		 * need to perform these steps:
		 * 
		 * 	pxsize = L(k) = L(0) / (2^k * 2^9)
		 * 	2^k = L(0) / (pxsize * 2^9)
		 *  k * Log 2 = Log L(0) - Log (pxsize * 2^9)
		 * 	k = Log (L(0)/2) - Log (pxsize * 2^8)
		 * 
		 */
		let theta0px = this._HIPSResMapK0[0];
		let k = Math.log(theta0px/2) - Math.log(pxsize * 2**8);
		k = Match.round(k);
		let nside = 2**k;
		return nside;
		
	}

	/**
	 * 
	 * @param {Object {ra, dec}} point  decimal degrees
	 * @returns {Object {phi_rad, theta_rad}} in radians
	 */
	convert2PhiTheta (point) {
		let phitheta_rad = {};
		let phiTheta_deg = this.astroDegToSpherical(point.ra, point.dec);
		phitheta_rad.phi_rad = this.degToRad(phiTheta_deg.phi);
        phitheta_rad.theta_rad = this.degToRad(phiTheta_deg.theta);
		return phitheta_rad;
	}

	astroDegToSphericalRad(raDeg, decDeg) {
		let phiThetaDeg = this.astroDegToSpherical(raDeg, decDeg);
		let phiThetaRad = {
			phi_rad: degToRad(phiThetaDeg.phiDeg),
			theta_rad: degToRad(phiThetaDeg.thetaDeg)
		}
		return phiThetaRad;
	}

	degToRad(degrees) {
		return (degrees / 180 ) * Math.PI ;
	}

	astroDegToSpherical(raDeg, decDeg){
	
		let phiDeg, thetaDeg;
		phiDeg = raDeg;
		if (phiDeg < 0){
			phiDeg += 360;
		}
		
		thetaDeg = 90 - decDeg;
		
		return {
			phi: phiDeg,
			theta: thetaDeg
		};
	}

	/**
	 * 
	 * @param {Object {phi_rad, theta_rad}} phiTheta_rad Center of the circle in radians
	 * @param {decimal} r Radius of the circle in radians
	 * @returns 
	 */
	computeBbox(phiTheta_rad, r) {

		let bbox = [];
		bbox.push(new Pointing(null, false, phiTheta_rad.theta_rad-r, phiTheta_rad.phi_rad-r));
		bbox.push(new Pointing(null, false, phiTheta_rad.theta_rad-r, phiTheta_rad.phi_rad+r));
		bbox.push(new Pointing(null, false, phiTheta_rad.theta_rad+r, phiTheta_rad.phi_rad+r));
		bbox.push(new Pointing(null, false, phiTheta_rad.theta_rad-r, phiTheta_rad.phi_rad-r));

        return bbox;
	}

	/**
	 * Generates an array where the key is the HPX tile number and the value is an array of {ImageItem.js} from the output projected image
	 * @param {Array[Array[ImageItem]]} imagePixelsMap Map of RA Dec generated in the OUTPUT projection with generatePxMatrix()
	 * @returns {} tilesMap
	 */
	generateTilesMap(imagePixelsMap) {

		this._tilesMap = new TilesMap(this._nside);
		// rows
		for (let i = 0; i < imagePixelsMap.length; i++) {
			// cols
			for (let j = 0; j < imagePixelsMap[i].length; j++) {
				let imgpx = imagePixelsMap[i][j];
				let phiTheta_rad = astroDegToSphericalRad(imgpx.getRA(), imgpx.getDec());
				let ptg = new Pointing(null, false, phiTheta_rad.theta_rad, phiTheta_rad.phiRad);
				let tileno = this._hp.ang2pix(ptg);
				this._tilesMap.pushImgPx2Tile(tileno, imgpx);
			}
		}
	}

	/**
	 * 
	 * @returns TilesMap.js object generated in generateTilesMap()
	 */
	getTilesMap () {
		return this._tilesMap;
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
    
	world2pixByTile(image, tileno, inData) {
		
		this._tilesMap.get(tileno).forEach(imgpx => { // <-- TODO ??? to be integrated into the proj.world2pix
			let pxij = this.world2pix(imgpx.ra, imgpx.dec, tileno);
			// imgpx contains i, j for the output projection, inData is organised with i, j from the input projection
			imgpx.value = inData[pxij.i, pxij.j];
			image.setPxValue(imgpx);
		});

	}

    /**
     * 
     * @param {*} radeg 
     * @param {*} decdeg
     *  
     */
    world2pix (radeg, decdeg, tileno) {

		if (this._tileno === undefined || this._tileno !== tileno) {
			this.setupByTile(tileno);
			this._tileno = tileno;
		}

        let phirad = radeg * DEG2RAD;
		let thetarad = decdeg * DEG2RAD;
        let xy = this.world2intermediate(phirad, thetarad);
        let ij = this.intermediate2pix(xy[0], xy[1]);
        
		return ij;
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


    // generatePxMatrix (minra, mindec, deltara, deltadec, fotw, pxscale) {}


    /**
	 * compute boundaries of the current facet and compute max and min theta and phi projected on the HEALPix grid
	 * @param {} nside optional
	 * @returns result: object containing facet's corners coordinates and min and max theta and phi
	 */
	getFacetProjectedCoordinates () {
		
        // nside = (nside !== undefined) ? nside : Math.pow(2, this._header.getValue('ORDER'));
		
		if (isNaN(this._nside)){
			throw new EvalError("nside not set");
		}
		let pix = this._pixno;

		let healpix = new Healpix(this._nside);
		let cornersVec3 = healpix.getBoundariesWithStep(pix, 1);
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

		// // case when RA is just crossing the origin (e.g. 357deg - 3deg)
		// for (let i = 0; i < pointings.length - 1; i++) {
		// 	let a = pointings[i].phi;
		// 	let b = pointings[i+1].phi;
		// 	if (Math.abs(a - b) > Math.PI) {
		// 		if (pointings[i].phi < pointings[i+1].phi) {
		// 			pointings[i].phi += 2 * Math.PI;
		// 		}else{
		// 			pointings[i+1].phi += 2 * Math.PI;
		// 		}
		// 	} 
		// }

		let result = {
			"min_y": NaN,
			"max_y": NaN,
			"min_x": NaN,
			"max_x": NaN,
			"gridPointsDeg": []
		}
		
		for (let j = 0; j < pointings.length; j++) {
			let coThetaRad = pointings[j].theta;
			let thetaRad = Math.PI/2 - coThetaRad;
		
			let phiRad = pointings[j].phi;
			

			// projection on healpix grid
			let xyDeg = this.projectOnHPXGrid(phiRad, thetaRad);
			result.gridPointsDeg[j * 2] = xyDeg[0];
			result.gridPointsDeg[j * 2 + 1] = xyDeg[1];
			
			if (isNaN(result.max_y) || xyDeg[1] > result.max_y ) {
				result.max_y = xyDeg[1];
			}
			if (isNaN(result.min_y) || xyDeg[1] < result.min_y) {
				result.min_y = xyDeg[1];
			}

			if (isNaN(result.max_x) || xyDeg[0] > result.max_x) {

				result.max_x = xyDeg[0];
			}
			if (isNaN(result.min_x) || xyDeg[0] < result.min_x) {
				result.min_x = xyDeg[0];
			}
		}

		return result;
	}
}

export default HiPSProjection;