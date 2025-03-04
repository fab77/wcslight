"use strict";
/**
 * @author Fabrizio Giordano (Fab77)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Point = void 0;
var Utils_js_1 = require("./Utils.js");
var CoordsType_js_1 = require("./CoordsType.js");
var Config_js_1 = require("../Config.js");
var Point = /** @class */ (function () {
    function Point(in_type, unit) {
        var coords = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            coords[_i - 2] = arguments[_i];
        }
        if (in_type == CoordsType_js_1.CoordsType.CARTESIAN) {
            this.cartesian.x = parseFloat(coords[0].toFixed(Config_js_1.Config.MAX_DECIMALS));
            this.cartesian.y = parseFloat(coords[1].toFixed(Config_js_1.Config.MAX_DECIMALS));
            this.cartesian.z = parseFloat(coords[2].toFixed(Config_js_1.Config.MAX_DECIMALS));
            this.spherical = (0, Utils_js_1.cartesianToSpherical)(this.cartesian);
            this.astro = (0, Utils_js_1.sphericalToAstro)(this.spherical);
        }
        else if (in_type == CoordsType_js_1.CoordsType.ASTRO) {
            this.astro = (0, Utils_js_1.fillAstro)(coords[0], coords[1], unit);
            this.spherical = (0, Utils_js_1.astroToSpherical)(this.astro);
            this.cartesian = (0, Utils_js_1.sphericalToCartesian)(this.spherical, 1.0); // TODO radius shall be taken from global (e.g. HiPS radius in case of HiPS)
        }
        else if (in_type == CoordsType_js_1.CoordsType.SPHERICAL) {
            this.spherical = (0, Utils_js_1.fillSpherical)(coords[0], coords[1], unit);
            this.cartesian = (0, Utils_js_1.sphericalToCartesian)(this.spherical, 1.0); // TODO radius shall be taken from global (e.g. HiPS radius in case of HiPS)
            this.astro = (0, Utils_js_1.sphericalToAstro)(this.spherical);
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
    Point.prototype.getSpherical = function () {
        return this.spherical;
    };
    Point.prototype.getAstro = function () {
        return this.astro;
    };
    Point.prototype.getCartesian = function () {
        return this.cartesian;
    };
    return Point;
}());
exports.Point = Point;
