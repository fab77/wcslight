import { ICoordsFormat } from "./ICoordsFormat";

export interface AstroCoords extends ICoordsFormat{
    raDeg: number;
	decDeg: number;
    raRad: number;
	decRad: number;
}