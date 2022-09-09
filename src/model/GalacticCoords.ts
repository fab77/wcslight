import { AstroCoords } from "./AstroCoords";

export interface GalacticCoords extends AstroCoords{
    raDeg: number;
	decDeg: number;
    raRad: number;
	decRad: number;
}