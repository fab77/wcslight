/**
 * @author Fabrizio Giordano (Fab)
 */
// import vec3 from 'gl-matrix';

import { AstroCoords } from "./AstroCoords.js";
import { CartesianCoords } from "./CartesianCoords.js";
import { HMSCoords } from "./HMSCoords.js";
import { NumberType } from "./NumberType.js";
import { SexagesimalCoords } from "./SexagesimalCoords.js";
import { SphericalCoords } from "./SphericalCoords.js";

function Utils(){
	
}

export function cartesianToSpherical(xyz: CartesianCoords): SphericalCoords{
	let dotXYZ = dot(xyz, xyz);
	let r = Math.sqrt(dotXYZ);	
	let thetaRad = Math.acos(xyz[2]/r);
	let thetaDeg = radToDeg(thetaRad);
	// NB: in atan(y/x) is written with params switched atan2(x, y)
	let phiRad = Math.atan2(xyz[1],xyz[0]);
	let phiDeg = radToDeg(phiRad);

	if (phiDeg < 0){
		phiDeg += 360;
	}
	return {
		phiDeg: phiDeg, 
		thetaDeg: thetaDeg,
		phiRad:phiRad,
		thetaRad: thetaRad
	};
};

export function sphericalToAstro(phiTheta: SphericalCoords): AstroCoords{
	let raDeg: number;
	let decDeg: number;

	raDeg = phiTheta.phiDeg;
	if (raDeg < 0){
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

export function astroToSpherical(raDec: AstroCoords): SphericalCoords{
	
	let phiDeg: number;
	let thetaDeg: number;

	phiDeg = raDec.raDeg;
	if (phiDeg < 0){
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

export function sphericalToCartesian(phiTheta: SphericalCoords, r: number): CartesianCoords{
	r = (r == undefined) ? 1 : r;
	var x = r * Math.sin(phiTheta.thetaRad) * Math.cos(phiTheta.phiRad);
	var y = r * Math.sin(phiTheta.thetaRad) * Math.sin(phiTheta.phiRad);
	var z = r * Math.cos(phiTheta.thetaRad);

	return {
		"x": x, 
		"y": y, 
		"z": z
	};
};

export function fillAstro(ra: number, dec: number, unit: NumberType): AstroCoords{
	if (unit == NumberType.DEGREES) {
		return {
			"raDeg": ra,
			"decDeg": dec,
			"raRad": degToRad(ra),
			"decRad": degToRad(dec)
		}
	} else if (unit == NumberType.RADIANS) {
		return {
			"raRad": ra,
			"decRad": dec,
			"raDeg": radToDeg(ra),
			"decDeg": radToDeg(dec)
		}
	} else {
		console.error("Wrong operation. NumberType " + unit + " not supported");
	}
	
}


export function fillSpherical(phi: number, theta: number, unit: NumberType):  SphericalCoords{
	if (unit == NumberType.DEGREES) {
		return {
			"phiDeg": phi,
			"thetaDeg": theta,
			"phiRad": degToRad(phi),
			"thetaRad": degToRad(theta)
		}
	} else if (unit == NumberType.RADIANS) {
		return {
			"phiDeg": radToDeg(phi),
			"thetaDeg": radToDeg(theta),
			"phiRad": phi,
			"thetaRad": theta
		}
	} else {
		console.error("Wrong operation. NumberType " + unit + " not supported");
	}
}

function dot(a: CartesianCoords, b: CartesianCoords) : number{
	return a.x * b.x + a.y * b.y + a.z * b.z;
  }

export function colorHex2RGB(hexColor: string): [number, number, number] {

//	console.log(hexColor);
	var hex1 = hexColor.substring(1,3);
	var hex2 = hexColor.substring(3,5);
	var hex3 = hexColor.substring(5,7);
	
	var dec1 = parseInt(hex1, 16);
	var dec2 = parseInt(hex2, 16);
	var dec3 = parseInt(hex3, 16);
	
	var rgb1 = (dec1 / 255).toFixed(2);
	var rgb2 = (dec2 / 255).toFixed(2);
	var rgb3 = (dec3 / 255).toFixed(2);
	
	return [parseFloat(rgb1), parseFloat(rgb2), parseFloat(rgb3)];

}

export function degToRad(degrees: number) : number{
	return (degrees / 180 ) * Math.PI ;
}

export function radToDeg(radians: number) : number{
	return radians * 180 / Math.PI;
}

export function raDegToHMS(raDeg: number): HMSCoords{
	
	var h = Math.floor(raDeg/15);
	var m = Math.floor((raDeg/15 - h) * 60);
	var s = (raDeg/15 - h - m/60) * 3600;
	
	return {
		h: h, 
		m: m, 
		s: s
	};
}

export function decDegToDMS(decDeg: number): SexagesimalCoords{
	var sign = 1;
	if (decDeg < 0){
		sign = -1;
	}
	
	var decDeg_abs = Math.abs(decDeg);
	var d = Math.trunc(decDeg_abs);
	
	var m = Math.trunc( (decDeg_abs - d) * 60);
	
	var s = (decDeg_abs - d - m/60) * 3600;
	d = d * sign;
	
	return {
		d: d, 
		m: m, 
		s: s
	};
}

function dms2DecDeg(decDMS: SexagesimalCoords){
	var sign = Math.sign(decDMS.d);
	var deg = (decDMS.d) + sign * (decDMS.m / 60) + sign * (decDMS.s/3600);
	return deg;
}

function hms2RaDeg(raHMS: HMSCoords){
	var sign = Math.sign(raHMS.h);
	var deg = (raHMS.h + sign * (raHMS.m / 60) + sign * (raHMS.s/3600)) * 15;
	return deg;
}

function worldToModel(xy: [number, number], radius: number): [number, number, number]{
	var x = xy[0];
	var y = xy[1];
	var z = Math.sqrt(radius*radius - xy[0]*xy[0] - xy[1]*xy[1]);
	return [x, y, z];
}

