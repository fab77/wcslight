import { ICoordsFormat } from "./ICoordsFormat";

export interface HMSCoords extends ICoordsFormat{
    h: number;
	m: number;
    s: number;
}