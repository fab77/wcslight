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
import ParseUtils from '../ParseUtils';
import {Hploc, Vec3, Pointing} from "healpixjs";
import Healpix from "healpixjs";

const RAD2DEG = 180 / Math.PI;
const DEG2RAD = Math.PI / 180;
const H = 4;
const K = 3;

class HEALPixProjection extends AbstractProjection {

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
    
    /** 
     * the conversion from RA, Deg to pixel (i, j) goes in this way:
     * convert (RA, Dec) to to intermediate coordinates (X, Y) World2Intermediate
     * convert (X, Y) to pixel coordinates (i, j)
     */ 
    _xyGridProj; // intermediate coordinates in the X, Y plane

    constructor () {
        super();
        this.THETAX = Hploc.asin( (K - 1)/K );
    }

    init(nside, pixno, naxis1, naxis2) {

        this._naxis1 = naxis1;
        this._naxis2 = naxis2;
        this._pixno = pixno;

        this._xyGridProj = {
			"min_y": NaN,
			"max_y": NaN,
			"min_x": NaN,
			"max_x": NaN,
			"gridPointsDeg": []
		}
		if (isNaN(nside)){
			throw new EvalError("nside not set");
		}

		let healpix = new Healpix(nside);
		let cornersVec3 = healpix.getBoundariesWithStep(this._pixno, 1);
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

		// return {
		// 	"skyCoords": [raDecDeg[0], raDecDeg[1]],
		// 	"xyCoords": [x, y]
		// };
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
    

    /**
     * 
     * @param {*} radeg 
     * @param {*} decdeg
     *  
     */
    world2pix (radeg, decdeg) {
        let phirad = radeg * DEG2RAD;
		let thetarad = decdeg * DEG2RAD;
        let xy = this.world2intermediate(phirad, thetarad);
        let ij = this.intermediate2pix(xy[0], xy[1]);
        return ij;
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


    generatePxMatrix (minra, mindec, deltara, deltadec, fotw, pxscale) {}


    /**
	 * compute boundaries of the current facet and compute max and min theta and phi projected on the HEALPix grid
	 * @param {} nside optional
	 * @returns result: object containing facet's corners coordinates and min and max theta and phi
	 */
	getFacetProjectedCoordinates (nside) {
		
        // nside = (nside !== undefined) ? nside : Math.pow(2, this._header.getValue('ORDER'));
		
		if (isNaN(this._nside)){
			throw new EvalError("nside not set");
		}
		let pix = this.pixno;

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

export default HEALPixProjection;