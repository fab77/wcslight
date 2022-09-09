import { ICoordsFormat } from "./ICoordsFormat";

export interface CartesianCoords extends ICoordsFormat{
    x: number;
	y: number;
    z: number;
}