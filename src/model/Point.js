/**
 * @author Fabrizio Giordano (Fab77)
 */
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Point_astro, _Point_spherical, _Point_cartesian;
import { sphericalToCartesian, cartesianToSpherical, sphericalToAstro, astroToSpherical, fillSpherical, fillAstro } from './Utils.js';
import { CoordsType } from './CoordsType.js';
export class Point {
    constructor(in_type, unit, ...coords) {
        _Point_astro.set(this, void 0);
        // #equatorial: EquatorialCoords;
        // #galactic: GalacticCoords;
        _Point_spherical.set(this, void 0);
        _Point_cartesian.set(this, void 0);
        if (in_type == CoordsType.CARTESIAN) {
            __classPrivateFieldGet(this, _Point_cartesian, "f").x = parseFloat(coords[0].toFixed(global.MAX_DECIMALS));
            __classPrivateFieldGet(this, _Point_cartesian, "f").y = parseFloat(coords[1].toFixed(global.MAX_DECIMALS));
            __classPrivateFieldGet(this, _Point_cartesian, "f").z = parseFloat(coords[2].toFixed(global.MAX_DECIMALS));
            __classPrivateFieldSet(this, _Point_spherical, cartesianToSpherical(__classPrivateFieldGet(this, _Point_cartesian, "f")), "f");
            __classPrivateFieldSet(this, _Point_astro, sphericalToAstro(__classPrivateFieldGet(this, _Point_spherical, "f")), "f");
        }
        else if (in_type == CoordsType.ASTRO) {
            __classPrivateFieldSet(this, _Point_astro, fillAstro(coords[0], coords[1], unit), "f");
            __classPrivateFieldSet(this, _Point_spherical, astroToSpherical(__classPrivateFieldGet(this, _Point_astro, "f")), "f");
            __classPrivateFieldSet(this, _Point_cartesian, sphericalToCartesian(__classPrivateFieldGet(this, _Point_spherical, "f"), 1.0), "f"); // TODO radius shall be taken from global (e.g. HiPS radius in case of HiPS)
        }
        else if (in_type == CoordsType.SPHERICAL) {
            __classPrivateFieldSet(this, _Point_spherical, fillSpherical(coords[0], coords[1], unit), "f");
            __classPrivateFieldSet(this, _Point_cartesian, sphericalToCartesian(__classPrivateFieldGet(this, _Point_spherical, "f"), 1.0), "f"); // TODO radius shall be taken from global (e.g. HiPS radius in case of HiPS)
            __classPrivateFieldSet(this, _Point_astro, sphericalToAstro(__classPrivateFieldGet(this, _Point_spherical, "f")), "f");
        }
        else {
            console.error("CoordsType " + in_type + " not recognised.");
        }
        if (__classPrivateFieldGet(this, _Point_spherical, "f").phiDeg > 360) {
            __classPrivateFieldGet(this, _Point_spherical, "f").phiDeg -= 360;
        }
        if (__classPrivateFieldGet(this, _Point_astro, "f").raDeg > 360) {
            __classPrivateFieldGet(this, _Point_astro, "f").raDeg -= 360;
        }
    }
    // constructor(in_options: ICoordsFormat, in_type: CoordsType){
    // 	if (in_type == CoordsType.CARTESIAN){
    // 		this.#cartesian.x = parseFloat((in_options as CartesianCoords).x.toFixed(global.MAX_DECIMALS));
    // 		this.#cartesian.y = parseFloat((in_options as CartesianCoords).y.toFixed(global.MAX_DECIMALS));
    // 		this.#cartesian.z = parseFloat((in_options as CartesianCoords).z.toFixed(global.MAX_DECIMALS));
    // 		this.#spherical = cartesianToSpherical(this.#cartesian);
    // 		this.#astro = sphericalToAstro(this.#spherical);
    // 	}else if (in_type == CoordsType.ASTRO){
    // 		if ((in_options as AstroCoords).raDeg && (in_options as AstroCoords).decDeg) {
    // 			this.#astro = radegDecdegToAstro((in_options as AstroCoords).raDeg,  (in_options as AstroCoords).decDeg );
    // 		} else if ((in_options as AstroCoords).raRad && (in_options as AstroCoords).decRad) {
    // 			this.#astro = raradDecradToAstro((in_options as AstroCoords).raRad,  (in_options as AstroCoords).decRad );
    // 		} else {
    // 			console.error("AstroCoords incomplete "+ in_options );
    // 			return null;
    // 		}
    // 		this.#spherical = astroToSpherical(this.#astro);
    // 		this.#cartesian = sphericalToCartesian(this.#spherical, 1.0); // TODO radius shall be taken from global (e.g. HiPS radius in case of HiPS)
    // 	}else if (in_type == CoordsType.SPHERICAL){
    // 		if ((in_options as SphericalCoords).phiDeg && (in_options as SphericalCoords).thetaDeg) {
    // 			this.#spherical = phidegThetadegToSpherical((in_options as SphericalCoords).phiDeg,  (in_options as SphericalCoords).thetaDeg );
    // 		} else if ((in_options as SphericalCoords).phiRad && (in_options as SphericalCoords).thetaRad) {
    // 			this.#spherical = phiradThetaradToSpherical((in_options as SphericalCoords).phiRad,  (in_options as SphericalCoords).thetaRad );
    // 		} else {
    // 			console.error("SphericalCoords incomplete "+ in_options );
    // 			return null;
    // 		}
    // 		this.#cartesian = sphericalToCartesian(this.#spherical, 1.0); // TODO radius shall be taken from global (e.g. HiPS radius in case of HiPS)
    // 		this.#astro = sphericalToAstro(this.#spherical);
    // 	}else{
    // 		console.error("CoordsType "+in_type+" not recognised.");
    // 	}
    // }
    get spherical() {
        return __classPrivateFieldGet(this, _Point_spherical, "f");
    }
    get astro() {
        return __classPrivateFieldGet(this, _Point_astro, "f");
    }
    get cartesian() {
        return __classPrivateFieldGet(this, _Point_cartesian, "f");
    }
}
_Point_astro = new WeakMap(), _Point_spherical = new WeakMap(), _Point_cartesian = new WeakMap();
