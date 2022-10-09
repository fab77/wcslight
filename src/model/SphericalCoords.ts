import { ICoordsFormat } from "./ICoordsFormat.js";

export interface SphericalCoords extends ICoordsFormat{
    phiDeg: number;
	thetaDeg: number;
    phiRad: number;
	thetaRad: number;
}