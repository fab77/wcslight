
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */


import {Healpix} from "../../../healpixjs-test-20220908/src/Healpix";
import {Pointing } from "../../../healpixjs-test-20220908/src/Pointing";
import {Hploc } from "../../../healpixjs-test-20220908/src/Hploc";

import {radToDeg} from '../model/Utils'; // TODO change package
import { CoordsType } from "../model/CoordsType";
import { HEALPixXYSpace } from "../model/HEALPixXYSpace";
import {Point} from "../model/Point";
import { SphericalCoords } from "../model/SphericalCoords";
import { NumberType } from '../model/NumberType';
import { AstroCoords } from "src/model/AstroCoords";
import { EquatorialCoords } from "src/model/EquatorialCoords";

export class HiPSHelper {

	
	static pxXtile: number = 512; // TODO in some cases it is different
	static DEFAULT_Naxis1_2: number = 512;
    static RES_ORDER_0: number = 58.6/HiPSHelper.pxXtile;
	static H: number = 4;
	static K: number = 3;
	static THETAX: number = Hploc.asin( (HiPSHelper.K - 1)/HiPSHelper.K );
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
	static computeHiPSOrder(pxsize: number): number{
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
		 *  k * Log2 2 = Log2 L(0) - Log2 (pxsize * 2^9)
		 * 	k = Log2 L(0) - Log2 (pxsize * 2^9)
		 * 
		 */


		let k = Math.log2(HiPSHelper.RES_ORDER_0/pxsize);
		k = Math.round(k);
		// let theta0px = HiPSHelper.RES_ORDER_0;
		// let k = Math.log2(theta0px) - Math.log2(pxsize * 2**9);
		// k = Match.round(k);
		// let nside = 2**k;
		// return {
        //     "nside" : nside,
        //     "norder" : k
        // };
		return k;
		
	}

	/**
	 * Reference: HiPS – Hierarchical Progressive Survey page 11
	 * pxsize =~ sqrt[4 * PI / (12 * (512 * 2^order)^2)]
	 * @param {*} order 
	 */
	static computePxSize(order: number): number {
		// TODO CHECK IT
		let pxsize = 1/(512 * 2**order) * Math.sqrt(Math.PI/3);
		return pxsize; 
	}

	// /**
	//  * 
	//  * @param {Object {ra, dec}} point  decimal degrees
	//  * @returns {Object {phi_rad, theta_rad}} in radians
	//  */
	// static convert2PhiTheta (point: Point) {
	// 	let phitheta_rad = {};
	// 	let phiTheta_deg = HiPSHelper.astroDegToSpherical(point.ra, point.dec);
	// 	phitheta_rad.phi_rad = HiPSHelper.degToRad(phiTheta_deg.phi);
    //     phitheta_rad.theta_rad = HiPSHelper.degToRad(phiTheta_deg.theta);
	// 	return phitheta_rad;
	// }

	// static astroDegToSphericalRad(raDeg: number, decDeg: number) {
	// 	let phiThetaDeg = HiPSHelper.astroDegToSpherical(raDeg, decDeg);
	// 	let phiThetaRad = {
	// 		phi_rad: HiPSHelper.degToRad(phiThetaDeg.phi),
	// 		theta_rad: HiPSHelper.degToRad(phiThetaDeg.theta)
	// 	}
	// 	return phiThetaRad;
	// }

	// static degToRad(degrees: number): number {
	// 	return (degrees / 180 ) * Math.PI ;
	// }

	// static radToDeg(rad: number): number {
	// 	return (rad / Math.PI ) * 180 ;
	// }

	// static astroDegToSpherical(raDeg: number, decDeg: number): Point{
	
	// 	let phiDeg: number;
	// 	let thetaDeg: number;
	// 	phiDeg = raDeg;
	// 	if (phiDeg < 0){
	// 		phiDeg += 360;
	// 	}
		
	// 	thetaDeg = 90 - decDeg;
		
	// 	return {
	// 		phi: phiDeg,
	// 		theta: thetaDeg
	// 	};
	// }

	/**
	 * 
	 * @param {Object {phi_rad, theta_rad}} phiTheta_rad Center of the circle in radians
	 * @param {decimal} r Radius of the circle in radians
	 * @returns 
	 */
	static computeBbox(point: Point, r: number): number[] {

		let bbox = [];
		bbox.push(new Pointing(null, false, point.spherical.thetaRad - r, point.spherical.phiRad - r));
		bbox.push(new Pointing(null, false, point.spherical.thetaRad - r, point.spherical.phiRad + r));
		bbox.push(new Pointing(null, false, point.spherical.thetaRad + r, point.spherical.phiRad + r));
		bbox.push(new Pointing(null, false, point.spherical.thetaRad - r, point.spherical.phiRad - r));

        return bbox;
	}

	static setupByTile(tileno: number, hp: Healpix): HEALPixXYSpace {

        let xyGridProj: HEALPixXYSpace = {
			"min_y": NaN,
			"max_y": NaN,
			"min_x": NaN,
			"max_x": NaN,
			"gridPointsDeg": []
		}
		
		 
		let cornersVec3 = hp.getBoundariesWithStep(tileno, 1);
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
			let p = new Point(CoordsType.ASTRO, NumberType.RADIANS, raRad, decRad);
			let xyDeg = HiPSHelper.world2intermediate(p.astro);
			xyGridProj.gridPointsDeg[j * 2] = xyDeg[0];
			xyGridProj.gridPointsDeg[j * 2 + 1] = xyDeg[1];

			if (isNaN(xyGridProj.max_y) || xyDeg[1] > xyGridProj.max_y ) {
				xyGridProj.max_y = xyDeg[1];
			}
			if (isNaN(xyGridProj.min_y) || xyDeg[1] < xyGridProj.min_y) {
				xyGridProj.min_y = xyDeg[1];
			}
			if (isNaN(xyGridProj.max_x) || xyDeg[0] > xyGridProj.max_x) {
				xyGridProj.max_x = xyDeg[0];
			}
			if (isNaN(xyGridProj.min_x) || xyDeg[0] < xyGridProj.min_x) {
				xyGridProj.min_x = xyDeg[0];
			}

		}
		return xyGridProj;
    }

	static world2intermediate(ac: AstroCoords): [number, number] {

        let x_grid: number;
		let y_grid: number;
		
		if ( Math.abs(ac.decRad) <= HiPSHelper.THETAX) { // equatorial belts
			x_grid = ac.raDeg;
			
			y_grid = Hploc.sin(ac.decRad) * HiPSHelper.K * 90 / HiPSHelper.H;
			

		} else if ( Math.abs(ac.decRad) > HiPSHelper.THETAX) { // polar zones

			let raDeg = ac.raDeg;

			let w = 0; // omega
			if (HiPSHelper.K % 2 !== 0 || ac.decRad > 0) { // K odd or thetax > 0
				w = 1;
			}

			let sigma = Math.sqrt( HiPSHelper.K * (1 - Math.abs(Hploc.sin(ac.decRad)) ) );
			let phi_c = - 180 + ( 2 * Math.floor( ((ac.raDeg + 180) * HiPSHelper.H/360) + ((1 - w)/2) ) + w ) * ( 180 / HiPSHelper.H );
			
			x_grid = phi_c + (raDeg - phi_c) * sigma;
			y_grid = (180  / HiPSHelper.H) * ( ((HiPSHelper.K + 1)/2) - sigma);

			if (ac.decRad < 0) {
				y_grid *= -1;
			}
		}

		return [x_grid, y_grid];

    }

	// static world2intermediate(sc: SphericalCoords): [number, number] {
    //     let x_grid: number;
	// 	let y_grid: number;
		
	// 	if ( Math.abs(sc.thetaRad) <= HiPSHelper.THETAX) { // equatorial belts
	// 		x_grid = sc.phiDeg;
			
	// 		y_grid = Hploc.sin(sc.thetaRad) * HiPSHelper.K * 90 / HiPSHelper.H;
			

	// 	} else if ( Math.abs(sc.thetaRad) > HiPSHelper.THETAX) { // polar zones

	// 		let phiDeg = sc.phiDeg;

	// 		let w = 0; // omega
	// 		if (HiPSHelper.K % 2 !== 0 || sc.thetaRad > 0) { // K odd or thetax > 0
	// 			w = 1;
	// 		}

	// 		let sigma = Math.sqrt( HiPSHelper.K * (1 - Math.abs(Hploc.sin(sc.thetaRad)) ) );
	// 		let phi_c = - 180 + ( 2 * Math.floor( ((sc.phiRad + 180) * HiPSHelper.H/360) + ((1 - w)/2) ) + w ) * ( 180 / HiPSHelper.H );
			
	// 		x_grid = phi_c + (phiDeg - phi_c) * sigma;
	// 		y_grid = (180  / HiPSHelper.H) * ( ((HiPSHelper.K + 1)/2) - sigma);

	// 		if (sc.thetaRad < 0) {
	// 			y_grid *= -1;
	// 		}
	// 	}

	// 	return [x_grid, y_grid];

    // }

    static intermediate2pix(x: number, y: number, xyGridProj: HEALPixXYSpace): [number, number] {
        let xInterval = Math.abs(xyGridProj.max_x - xyGridProj.min_x);
		let yInterval = Math.abs(xyGridProj.max_y - xyGridProj.min_y);

		let i_norm: number;
		let j_norm: number;
		if ( (xyGridProj.min_x > 360 || xyGridProj.max_x > 360) && x < xyGridProj.min_x) {
			i_norm = (x + 360 - xyGridProj.min_x) / xInterval;	
		}else {
			i_norm = (x - xyGridProj.min_x) / xInterval;
		}
		j_norm = (y - xyGridProj.min_y) / yInterval;
		
		
		let i = 0.5 - (i_norm - j_norm);
		let j = (i_norm + j_norm) - 0.5;

		// TODO CHECK THE FOLLOWING. BEFORE IT WAS i = Math.floor(i * HiPSHelper.pxXtile);
		i = Math.floor(i * HiPSHelper.DEFAULT_Naxis1_2);
		j = Math.floor(j * HiPSHelper.DEFAULT_Naxis1_2);
		// return [i , j];
		return [i , HiPSHelper.DEFAULT_Naxis1_2 - j -1];

    }


	static pix2intermediate (i: number, j: number, xyGridProj: HEALPixXYSpace, naxis1: number, naxis2: number): [number, number] {
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
		let cnaxis1 = HiPSHelper.pxXtile;
		let cnaxis2 = HiPSHelper.pxXtile;
		if (naxis1) {
			cnaxis1 = naxis1;
		}
		if (naxis2) {
			cnaxis2 = naxis2;
		}
        let i_norm = (i + 0.5) / cnaxis1;
		let j_norm = (j + 0.5) / cnaxis2;

        let xInterval = Math.abs(xyGridProj.max_x - xyGridProj.min_x) / 2.0;
		let yInterval = Math.abs(xyGridProj.max_y - xyGridProj.min_y) / 2.0;
		let yMean = (xyGridProj.max_y + xyGridProj.min_y) / 2.0;

        // bi-linear interpolation
		let x = xyGridProj.max_x - xInterval * (i_norm + j_norm);
		let y = yMean - yInterval * (j_norm - i_norm);
		
        return [x, y];
    }


    static intermediate2world(x: number, y: number): Point {

        let phiDeg: number;
		let thetaDeg: number;
		let Yx = 90 * (HiPSHelper.K - 1) / HiPSHelper.H;

		

		if (Math.abs(y) <= Yx) { // equatorial belts

			phiDeg = x;
			thetaDeg =  radToDeg( Math.asin( (y  * HiPSHelper.H) / (90 * HiPSHelper.K)) );

		} else if (Math.abs(y) > Yx) { // polar regions

			let sigma = (HiPSHelper.K + 1) / 2 - Math.abs(y * HiPSHelper.H) / 180;
			let thetaRad = Hploc.asin( 1 - (sigma * sigma) / HiPSHelper.K );
			let w = 0; // omega
			if (HiPSHelper.K % 2 !== 0 || thetaRad > 0) { // K odd or thetax > 0
				w = 1;
			}
			let x_c = -180 + ( 2 * Math.floor((x + 180) * HiPSHelper.H/360 + (1 - w) /2  ) + w) * (180 / HiPSHelper.H);
			phiDeg = x_c + ( x - x_c) / sigma;
			thetaDeg = radToDeg(thetaRad);
			if (y <= 0){
				thetaDeg *= -1;
			}
		}
		// return [phiDeg, thetaDeg];
		// TODO CHECK THIS!
		// let p = new Point(CoordsType.SPHERICAL, NumberType.DEGREES, phiDeg, thetaDeg);
		let p = new Point(CoordsType.ASTRO, NumberType.DEGREES, phiDeg, thetaDeg);
		
		return p;

    }

}
