import { AstroCoords } from "./AstroCoords";

export interface EquatorialCoords extends AstroCoords{
    raDeg: number;
	decDeg: number;
    raRad: number;
	decRad: number;
}