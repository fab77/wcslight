/**
 * @author Fabrizio Giordano (Fab77)
 */

import {sphericalToCartesian, cartesianToSpherical, sphericalToAstro, astroToSpherical, fillSpherical, fillAstro} from './Utils.js';
import { CartesianCoords } from './CartesianCoords.js';
import { AstroCoords} from './AstroCoords.js';
import { CoordsType } from './CoordsType.js';
import { SphericalCoords } from './SphericalCoords.js';
import { NumberType } from './NumberType.js';
import { EquatorialCoords } from './EquatorialCoords.js';
import { GalacticCoords } from './GalacticCoords.js';

export class Point{

	#astro: AstroCoords;
	// #equatorial: EquatorialCoords;
	// #galactic: GalacticCoords;

	#spherical: SphericalCoords;
	#cartesian: CartesianCoords;

	constructor(in_type: CoordsType, unit: NumberType, ...coords: Array<number>) {

		if (in_type == CoordsType.CARTESIAN){
			this.#cartesian.x = parseFloat(coords[0].toFixed(global.MAX_DECIMALS));
			this.#cartesian.y = parseFloat(coords[1].toFixed(global.MAX_DECIMALS));
			this.#cartesian.z = parseFloat(coords[2].toFixed(global.MAX_DECIMALS));
			this.#spherical = cartesianToSpherical(this.#cartesian);

			this.#astro = sphericalToAstro(this.#spherical);
			
		} else if (in_type == CoordsType.ASTRO){
			this.#astro = fillAstro(coords[0],  coords[1], unit);
			this.#spherical = astroToSpherical(this.#astro);
			this.#cartesian = sphericalToCartesian(this.#spherical, 1.0); // TODO radius shall be taken from global (e.g. HiPS radius in case of HiPS)
	
		} else if (in_type == CoordsType.SPHERICAL){
			this.#spherical = fillSpherical(coords[0],  coords[1], unit);
			this.#cartesian = sphericalToCartesian(this.#spherical, 1.0); // TODO radius shall be taken from global (e.g. HiPS radius in case of HiPS)
			this.#astro = sphericalToAstro(this.#spherical);

		} else{
			console.error("CoordsType "+in_type+" not recognised.");
		}
		if (this.#spherical.phiDeg > 360) {
			this.#spherical.phiDeg -= 360;
		}
		if (this.#astro.raDeg > 360) {
			this.#astro.raDeg -= 360;
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
		return this.#spherical;
	}

	get astro() {
		return this.#astro;
	}

	get cartesian() {
		return this.#cartesian;
	}
	// // taken from Healpixjs->Vec3. //TODO Point and Vec3 should be unified 
	// /** Scale the vector by a given factor
    // @param n the scale factor */
	// scale(n: number): Point{
	// 	return new Point(CoordsType.CARTESIAN, NumberType.DECIMAL, this.x*n, this.y*n, this.z*n);
	// };
	// // taken from Healpixjs->Vec3. //TODO Point and Vec3 should be unified 
	// dot(v: Point): number{ 
	// 	return this.x*v.x + this.y*v.y + this.z*v.z; 
	// };
	// // taken from Healpixjs->Vec3. //TODO Point and Vec3 should be unified
	// cross(v: Point): Point{ 
	// 	return new Point(CoordsType.CARTESIAN, NumberType.DECIMAL, this.y*v.z - v.y*this.z, this.z*v.x - v.z*this.x, this.x*v.y - v.x*this.y);
	// };
	// // taken from Healpixjs->Vec3. //TODO Point and Vec3 should be unified
	// norm() : Point{
	// 	let d = 1./this.length();
	// 	return new Point(CoordsType.CARTESIAN, NumberType.DECIMAL, this.x*d, this.y*d, this.z*d);
	// };
	// // taken from Healpixjs->Vec3. //TODO Point and Vec3 should be unified
	// length(): number{ 
	// 	return Math.sqrt(this.lengthSquared()); 
	// };
	// // taken from Healpixjs->Vec3. //TODO Point and Vec3 should be unified
	// lengthSquared(): number{ 
	// 	return this.x*this.x + this.y*this.y + this.z*this.z; 
  	// };

	// subtract(v: Point) : Point{
	// 	return new Point(CoordsType.CARTESIAN, NumberType.DECIMAL, this.x - v.x, this.y - v.y, this.z - v.z);
	// }

	// add(v: Point) : Point{
	// 	return new Point(CoordsType.CARTESIAN, NumberType.DECIMAL, this.x + v.x, this.y + v.y, this.z + v.z);
	// }
	

	// get x(){
	// 	return this._x;
	// }
	
	// get y(){
	// 	return this._y;
	// }
	
	// get z(){
	// 	return this._z;
	// }
	
	// get xyz(){
    //     return this._xyz;
    // }
	
    // get raDeg(){
    //     return this._raDeg;
    // }
    
    // get decDeg(){
    //     return this._decDeg;
    // }
    
    // get raDecDeg(){
    //     return this._raDecDeg;
    // }
    
    // toADQL(){
    // 	return this._raDecDeg[0]+","+this._raDecDeg[1];
    // }
    
    // toString(){
    // 	return "(raDeg, decDeg) => ("+this._raDecDeg[0]+","+this._raDecDeg[1]+") (x, y,z) => ("+this._xyz[0]+","+this._xyz[1]+","+this._xyz[2]+")";
    // }
}

