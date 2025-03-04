/**
 * @author Fabrizio Giordano (Fab77)
 */
import { sphericalToCartesian, cartesianToSpherical, sphericalToAstro, astroToSpherical, fillSpherical, fillAstro } from './Utils.js';
import { CoordsType } from './CoordsType.js';
import { Config } from '../Config.js';
export class Point {
    constructor(in_type, unit, ...coords) {
        if (in_type == CoordsType.CARTESIAN) {
            this.cartesian.x = parseFloat(coords[0].toFixed(Config.MAX_DECIMALS));
            this.cartesian.y = parseFloat(coords[1].toFixed(Config.MAX_DECIMALS));
            this.cartesian.z = parseFloat(coords[2].toFixed(Config.MAX_DECIMALS));
            this.spherical = cartesianToSpherical(this.cartesian);
            this.astro = sphericalToAstro(this.spherical);
        }
        else if (in_type == CoordsType.ASTRO) {
            this.astro = fillAstro(coords[0], coords[1], unit);
            this.spherical = astroToSpherical(this.astro);
            this.cartesian = sphericalToCartesian(this.spherical, 1.0); // TODO radius shall be taken from global (e.g. HiPS radius in case of HiPS)
        }
        else if (in_type == CoordsType.SPHERICAL) {
            this.spherical = fillSpherical(coords[0], coords[1], unit);
            this.cartesian = sphericalToCartesian(this.spherical, 1.0); // TODO radius shall be taken from global (e.g. HiPS radius in case of HiPS)
            this.astro = sphericalToAstro(this.spherical);
        }
        else {
            console.error("CoordsType " + in_type + " not recognised.");
        }
        if (this.spherical.phiDeg > 360) {
            this.spherical.phiDeg -= 360;
        }
        if (this.astro.raDeg > 360) {
            this.astro.raDeg -= 360;
        }
    }
    // constructor(in_options: ICoordsFormat, in_type: CoordsType){
    // 	if (in_type == CoordsType.CARTESIAN){
    // 		this.cartesian.x = parseFloat((in_options as CartesianCoords).x.toFixed(global.MAX_DECIMALS));
    // 		this.cartesian.y = parseFloat((in_options as CartesianCoords).y.toFixed(global.MAX_DECIMALS));
    // 		this.cartesian.z = parseFloat((in_options as CartesianCoords).z.toFixed(global.MAX_DECIMALS));
    // 		this.spherical = cartesianToSpherical(this.cartesian);
    // 		this.astro = sphericalToAstro(this.spherical);
    // 	}else if (in_type == CoordsType.ASTRO){
    // 		if ((in_options as AstroCoords).raDeg && (in_options as AstroCoords).decDeg) {
    // 			this.astro = radegDecdegToAstro((in_options as AstroCoords).raDeg,  (in_options as AstroCoords).decDeg );
    // 		} else if ((in_options as AstroCoords).raRad && (in_options as AstroCoords).decRad) {
    // 			this.astro = raradDecradToAstro((in_options as AstroCoords).raRad,  (in_options as AstroCoords).decRad );
    // 		} else {
    // 			console.error("AstroCoords incomplete "+ in_options );
    // 			return null;
    // 		}
    // 		this.spherical = astroToSpherical(this.astro);
    // 		this.cartesian = sphericalToCartesian(this.spherical, 1.0); // TODO radius shall be taken from global (e.g. HiPS radius in case of HiPS)
    // 	}else if (in_type == CoordsType.SPHERICAL){
    // 		if ((in_options as SphericalCoords).phiDeg && (in_options as SphericalCoords).thetaDeg) {
    // 			this.spherical = phidegThetadegToSpherical((in_options as SphericalCoords).phiDeg,  (in_options as SphericalCoords).thetaDeg );
    // 		} else if ((in_options as SphericalCoords).phiRad && (in_options as SphericalCoords).thetaRad) {
    // 			this.spherical = phiradThetaradToSpherical((in_options as SphericalCoords).phiRad,  (in_options as SphericalCoords).thetaRad );
    // 		} else {
    // 			console.error("SphericalCoords incomplete "+ in_options );
    // 			return null;
    // 		}
    // 		this.cartesian = sphericalToCartesian(this.spherical, 1.0); // TODO radius shall be taken from global (e.g. HiPS radius in case of HiPS)
    // 		this.astro = sphericalToAstro(this.spherical);
    // 	}else{
    // 		console.error("CoordsType "+in_type+" not recognised.");
    // 	}
    // }
    getSpherical() {
        return this.spherical;
    }
    getAstro() {
        return this.astro;
    }
    getCartesian() {
        return this.cartesian;
    }
}
//# sourceMappingURL=Point.js.map