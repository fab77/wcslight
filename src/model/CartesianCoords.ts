import { ICoordsFormat } from "./ICoordsFormat.js";

export interface CartesianCoords extends ICoordsFormat{
    x: number;
	y: number;
    z: number;
}