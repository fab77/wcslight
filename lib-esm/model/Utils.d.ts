/**
 * @author Fabrizio Giordano (Fab)
 */
import { AstroCoords } from "./AstroCoords.js";
import { CartesianCoords } from "./CartesianCoords.js";
import { HMSCoords } from "./HMSCoords.js";
import { NumberType } from "./NumberType.js";
import { SexagesimalCoords } from "./SexagesimalCoords.js";
import { SphericalCoords } from "./SphericalCoords.js";
export declare function cartesianToSpherical(xyz: CartesianCoords): SphericalCoords;
export declare function sphericalToAstro(phiTheta: SphericalCoords): AstroCoords;
export declare function astroToSpherical(raDec: AstroCoords): SphericalCoords;
export declare function sphericalToCartesian(phiTheta: SphericalCoords, r: number): CartesianCoords;
export declare function fillAstro(ra: number, dec: number, unit: NumberType): AstroCoords;
export declare function fillSpherical(phi: number, theta: number, unit: NumberType): SphericalCoords;
export declare function colorHex2RGB(hexColor: string): [number, number, number];
export declare function degToRad(degrees: number): number;
export declare function radToDeg(radians: number): number;
export declare function raDegToHMS(raDeg: number): HMSCoords;
export declare function decDegToDMS(decDeg: number): SexagesimalCoords;
//# sourceMappingURL=Utils.d.ts.map