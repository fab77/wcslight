


class HiPSHelper {

	static pxXtile = 512; // TODO in some cases it is different
    static RES_ORDER_0 = 58.6/HIPSResMapK0.pxXtile; 
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
	static computeHiPSOrder(pxsize){
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
	 * 
	 * @param {Object {ra, dec}} point  decimal degrees
	 * @returns {Object {phi_rad, theta_rad}} in radians
	 */
	static convert2PhiTheta (point) {
		let phitheta_rad = {};
		let phiTheta_deg = HiPSHelper.astroDegToSpherical(point.ra, point.dec);
		phitheta_rad.phi_rad = HiPSHelper.degToRad(phiTheta_deg.phi);
        phitheta_rad.theta_rad = HiPSHelper.degToRad(phiTheta_deg.theta);
		return phitheta_rad;
	}

	static astroDegToSphericalRad(raDeg, decDeg) {
		let phiThetaDeg = HiPSHelper.astroDegToSpherical(raDeg, decDeg);
		let phiThetaRad = {
			phi_rad: degToRad(phiThetaDeg.phiDeg),
			theta_rad: degToRad(phiThetaDeg.thetaDeg)
		}
		return phiThetaRad;
	}

	static degToRad(degrees) {
		return (degrees / 180 ) * Math.PI ;
	}

	static astroDegToSpherical(raDeg, decDeg){
	
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
	static computeBbox(phiTheta_rad, r) {

		let bbox = [];
		bbox.push(new Pointing(null, false, phiTheta_rad.theta_rad-r, phiTheta_rad.phi_rad-r));
		bbox.push(new Pointing(null, false, phiTheta_rad.theta_rad-r, phiTheta_rad.phi_rad+r));
		bbox.push(new Pointing(null, false, phiTheta_rad.theta_rad+r, phiTheta_rad.phi_rad+r));
		bbox.push(new Pointing(null, false, phiTheta_rad.theta_rad-r, phiTheta_rad.phi_rad-r));

        return bbox;
	}
}

export default HiPSHelper;