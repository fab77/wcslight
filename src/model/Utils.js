"use strict";
/**
 * @author Fabrizio Giordano (Fab)
 */
// import vec3 from 'gl-matrix';
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartesianToSpherical = cartesianToSpherical;
exports.sphericalToAstro = sphericalToAstro;
exports.astroToSpherical = astroToSpherical;
exports.sphericalToCartesian = sphericalToCartesian;
exports.fillAstro = fillAstro;
exports.fillSpherical = fillSpherical;
exports.colorHex2RGB = colorHex2RGB;
exports.degToRad = degToRad;
exports.radToDeg = radToDeg;
exports.raDegToHMS = raDegToHMS;
exports.decDegToDMS = decDegToDMS;
var NumberType_js_1 = require("./NumberType.js");
function Utils() {
}
function cartesianToSpherical(xyz) {
    var dotXYZ = dot(xyz, xyz);
    var r = Math.sqrt(dotXYZ);
    var thetaRad = Math.acos(xyz[2] / r);
    var thetaDeg = radToDeg(thetaRad);
    // NB: in atan(y/x) is written with params switched atan2(x, y)
    var phiRad = Math.atan2(xyz[1], xyz[0]);
    var phiDeg = radToDeg(phiRad);
    if (phiDeg < 0) {
        phiDeg += 360;
    }
    return {
        phiDeg: phiDeg,
        thetaDeg: thetaDeg,
        phiRad: phiRad,
        thetaRad: thetaRad
    };
}
;
function sphericalToAstro(phiTheta) {
    var raDeg;
    var decDeg;
    raDeg = phiTheta.phiDeg;
    if (raDeg < 0) {
        raDeg += 360;
    }
    decDeg = 90 - phiTheta.thetaDeg;
    return {
        "raDeg": raDeg,
        "decDeg": decDeg,
        "raRad": degToRad(raDeg),
        "decRad": degToRad(decDeg)
    };
}
function astroToSpherical(raDec) {
    var phiDeg;
    var thetaDeg;
    phiDeg = raDec.raDeg;
    if (phiDeg < 0) {
        phiDeg += 360;
    }
    thetaDeg = 90 - raDec.decDeg;
    return {
        "phiDeg": phiDeg,
        "thetaDeg": thetaDeg,
        "phiRad": degToRad(phiDeg),
        "thetaRad": degToRad(thetaDeg),
    };
}
function sphericalToCartesian(phiTheta, r) {
    r = (r == undefined) ? 1 : r;
    var x = r * Math.sin(phiTheta.thetaRad) * Math.cos(phiTheta.phiRad);
    var y = r * Math.sin(phiTheta.thetaRad) * Math.sin(phiTheta.phiRad);
    var z = r * Math.cos(phiTheta.thetaRad);
    return {
        "x": x,
        "y": y,
        "z": z
    };
}
;
function fillAstro(ra, dec, unit) {
    if (unit == NumberType_js_1.NumberType.DEGREES) {
        return {
            "raDeg": ra,
            "decDeg": dec,
            "raRad": degToRad(ra),
            "decRad": degToRad(dec)
        };
    }
    else if (unit == NumberType_js_1.NumberType.RADIANS) {
        return {
            "raRad": ra,
            "decRad": dec,
            "raDeg": radToDeg(ra),
            "decDeg": radToDeg(dec)
        };
    }
    else {
        console.error("Wrong operation. NumberType " + unit + " not supported");
    }
}
function fillSpherical(phi, theta, unit) {
    if (unit == NumberType_js_1.NumberType.DEGREES) {
        return {
            "phiDeg": phi,
            "thetaDeg": theta,
            "phiRad": degToRad(phi),
            "thetaRad": degToRad(theta)
        };
    }
    else if (unit == NumberType_js_1.NumberType.RADIANS) {
        return {
            "phiDeg": radToDeg(phi),
            "thetaDeg": radToDeg(theta),
            "phiRad": phi,
            "thetaRad": theta
        };
    }
    else {
        console.error("Wrong operation. NumberType " + unit + " not supported");
    }
}
function dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}
function colorHex2RGB(hexColor) {
    //	console.log(hexColor);
    var hex1 = hexColor.substring(1, 3);
    var hex2 = hexColor.substring(3, 5);
    var hex3 = hexColor.substring(5, 7);
    var dec1 = parseInt(hex1, 16);
    var dec2 = parseInt(hex2, 16);
    var dec3 = parseInt(hex3, 16);
    var rgb1 = (dec1 / 255).toFixed(2);
    var rgb2 = (dec2 / 255).toFixed(2);
    var rgb3 = (dec3 / 255).toFixed(2);
    return [parseFloat(rgb1), parseFloat(rgb2), parseFloat(rgb3)];
}
function degToRad(degrees) {
    return (degrees / 180) * Math.PI;
}
function radToDeg(radians) {
    return radians * 180 / Math.PI;
}
function raDegToHMS(raDeg) {
    var h = Math.floor(raDeg / 15);
    var m = Math.floor((raDeg / 15 - h) * 60);
    var s = (raDeg / 15 - h - m / 60) * 3600;
    return {
        h: h,
        m: m,
        s: s
    };
}
function decDegToDMS(decDeg) {
    var sign = 1;
    if (decDeg < 0) {
        sign = -1;
    }
    var decDeg_abs = Math.abs(decDeg);
    var d = Math.trunc(decDeg_abs);
    var m = Math.trunc((decDeg_abs - d) * 60);
    var s = (decDeg_abs - d - m / 60) * 3600;
    d = d * sign;
    return {
        d: d,
        m: m,
        s: s
    };
}
function dms2DecDeg(decDMS) {
    var sign = Math.sign(decDMS.d);
    var deg = (decDMS.d) + sign * (decDMS.m / 60) + sign * (decDMS.s / 3600);
    return deg;
}
function hms2RaDeg(raHMS) {
    var sign = Math.sign(raHMS.h);
    var deg = (raHMS.h + sign * (raHMS.m / 60) + sign * (raHMS.s / 3600)) * 15;
    return deg;
}
function worldToModel(xy, radius) {
    var x = xy[0];
    var y = xy[1];
    var z = Math.sqrt(radius * radius - xy[0] * xy[0] - xy[1] * xy[1]);
    return [x, y, z];
}
