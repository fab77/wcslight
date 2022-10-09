import { AstroCoords } from "./AstroCoords.js";

export interface GalacticCoords extends AstroCoords{
    raDeg: number;
	decDeg: number;
    raRad: number;
	decRad: number;
}