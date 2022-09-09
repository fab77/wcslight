import { ICoordsFormat } from "./ICoordsFormat";

export interface SphericalCoords extends ICoordsFormat{
    phiDeg: number;
	thetaDeg: number;
    phiRad: number;
	thetaRad: number;
}