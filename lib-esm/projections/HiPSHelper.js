/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
import { Healpix } from 'healpixjs';
import { Pointing } from "healpixjs";
import { Hploc } from "healpixjs";
export class HiPSHelper {
    // static pxXtile: number = 512; // TODO in some cases it is different
    static DEFAULT_Naxis1_2 = 512;
    // static RES_ORDER_0: number = 58.6 / HiPSHelper.pxXtile;
    static RES_ORDER_0 = 58.6;
    static H = 4;
    static K = 3;
    static THETAX = Hploc.asin((HiPSHelper.K - 1) / HiPSHelper.K);
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
    // static computeHiPSOrder(pxsize: number, pxXtile: number): number {
    // 	/**
    // 	 * with same order k (table 1), HIPS angular resolution is higher of order of 512 (2^9) pixels than 
    // 	 * the HEALPix. This is because each tile in a HiPS is represented by default by 512x512 pixels.\
    // 	 * Angular resolution of different HEALPix orders in respect to the order 0, can be calculated this
    // 	 * way:
    // 	 * 
    // 	 * 	L(k) = L(0) / 2^k = 58.6 / 2^k
    // 	 * 
    // 	 * Therefore, in the case of HiPS we need to take into account the extra resolution given by the 
    // 	 * 512x512 (2^9) tiles. In this case the above becomes:
    // 	 * 	
    // 	 * 	L(k) = L(0) / (2^k * 2^9) 
    // 	 * 
    // 	 * Though, in order to compute the required order starting from the pxsize desired (in input) we
    // 	 * need to perform these steps:
    // 	 * 
    // 	 * 	pxsize = L(k) = L(0) / (2^k * 2^9)
    // 	 * 	2^k = L(0) / (pxsize * 2^9)
    // 	 *  k * Log2 2 = Log2 L(0) - Log2 (pxsize * 2^9)
    // 	 * 	k = Log2 L(0) - Log2 (pxsize * 2^9)
    // 	 * 
    // 	 */
    // 	let k = Math.log2( (HiPSHelper.RES_ORDER_0 / pxXtile) / pxsize);
    // 	// let k = Math.log2(HiPSHelper.RES_ORDER_0 / (pxXtile * pxsize));
    // 	k = Math.round(k);
    // 	// let theta0px = HiPSHelper.RES_ORDER_0;
    // 	// let k = Math.log2(theta0px) - Math.log2(pxsize * 2**9);
    // 	// k = Match.round(k);
    // 	// let nside = 2**k;
    // 	// return {
    // 	//     "nside" : nside,
    // 	//     "norder" : k
    // 	// };
    // 	return k;
    // }
    // static computeHiPSOrder2(pxsize: number, pxXtile: number): number {
    // 	const k = Math.log2( Math.sqrt(Math.PI/ 3) / ( pxsize * pxXtile) )
    // 	const order = Math.round(k);
    // 	console.warn(k)
    // 	return order;
    // }
    // based on "HiPS – Hierarchical Progressive Survey" IVOA recomandation (formula on table 5)
    static computeOrder(pxAngSizeDeg, pxTileWidth) {
        console.log(`Computing HiPS order having pixel angular size of ${pxAngSizeDeg} in degrees`);
        const deg2rad = Math.PI / 180;
        const pxAngSizeRad = pxAngSizeDeg * deg2rad;
        console.log(`pixel angular res in radians ${pxAngSizeRad}`);
        const computedOrder = 0.5 * Math.log2(Math.PI / (3 * pxAngSizeRad * pxAngSizeRad * pxTileWidth * pxTileWidth));
        console.log(`Order ${computedOrder}`);
        if (computedOrder < 0) {
            return 0;
        }
        return Math.floor(computedOrder);
    }
    static getHelpixByOrder(order) {
        const nside = 2 ** order;
        const healpix = new Healpix(nside);
        return healpix;
    }
    static getHelpixBypxAngSize(pixelAngulaSize, TILE_WIDTH, hipsMaxOrder = null) {
        let healpixOrder = HiPSHelper.computeOrder(pixelAngulaSize, TILE_WIDTH);
        if (hipsMaxOrder && hipsMaxOrder > 0) {
            if (healpixOrder > hipsMaxOrder) {
                healpixOrder = hipsMaxOrder;
            }
        }
        const nside = 2 ** healpixOrder;
        const healpix = new Healpix(nside);
        return healpix;
    }
    // based on "HiPS – Hierarchical Progressive Survey" IVOA recomandation (formula on table 5)
    static computePxAngularSize(pxTileWidth, order) {
        const computedPxAngSizeRadiant = Math.sqrt(4 * Math.PI / (12 * (pxTileWidth * (2 ** order)) ** 2));
        console.log(`Computing Pixel size with tile of ${pxTileWidth} pixels and order ${order}`);
        const rad2deg = 180 / Math.PI;
        const deg = computedPxAngSizeRadiant * rad2deg;
        const arcmin = computedPxAngSizeRadiant * rad2deg * 60;
        const arcsec = computedPxAngSizeRadiant * rad2deg * 3600;
        console.log("Pixel size in radiant:" + computedPxAngSizeRadiant);
        console.log("Pixel size in degrees:" + deg);
        console.log("Pixel size in arcmin:" + arcmin);
        console.log("Pixel size in arcsec:" + arcsec);
        return {
            "rad": computedPxAngSizeRadiant,
            "deg": deg,
            "arcmin": arcmin,
            "arcsec": arcsec
        };
    }
    /**
     * Reference: HiPS – Hierarchical Progressive Survey page 11
     * pxsize =~ sqrt[4 * PI / (12 * (512 * 2^order)^2)]
     * @param {*} order
     */
    static computePxSize(order, pxXtile) {
        // TODO CHECK IT
        // let pxsize = 1 / (512 * 2 ** order) * Math.sqrt(Math.PI / 3);
        let pxsize = 1 / (pxXtile * 2 ** order) * Math.sqrt(Math.PI / 3);
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
    static computeBbox(point, r) {
        let bbox = [];
        bbox.push(new Pointing(null, false, point.getSpherical().thetaRad - r, point.getSpherical().phiRad - r));
        bbox.push(new Pointing(null, false, point.getSpherical().thetaRad - r, point.getSpherical().phiRad + r));
        bbox.push(new Pointing(null, false, point.getSpherical().thetaRad + r, point.getSpherical().phiRad + r));
        bbox.push(new Pointing(null, false, point.getSpherical().thetaRad - r, point.getSpherical().phiRad - r));
        return bbox;
    }
}
//# sourceMappingURL=HiPSHelper.js.map