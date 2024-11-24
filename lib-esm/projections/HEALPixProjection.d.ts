import { FITSHeader } from 'jsfitsio';
import { FITSParsed } from 'jsfitsio';
import { ImagePixel } from "../model/ImagePixel.js";
import { Point } from "../model/Point.js";
import { AbstractProjection } from "./AbstractProjection.js";
export declare class HEALPixProjection extends AbstractProjection {
    constructor();
    get fitsUsed(): String[];
    initFromFile(fitsfilepath?: string, hipsURI?: string, pxsize?: number, order?: number): Promise<FITSParsed>;
    prepareFITSHeader(fitsHeaderParams: FITSHeader): FITSHeader[];
    getFITSHeader(): FITSHeader[];
    getCommonFitsHeaderParams(): FITSHeader;
    extractPhysicalValues(fits: FITSParsed): number[][];
    getPixValues(inputPixelsList: ImagePixel[]): Promise<Uint8Array>;
    setPxsValue(values: Uint8Array, fitsHeaderParams: FITSHeader): Map<number, Uint8Array[]>;
    getImageRADecList(center: Point, radius: number, pxsize: number): Array<[number, number]>;
    pix2world(i: number, j: number): Point;
    world2pix(radeclist: number[][]): ImagePixel[];
}
//# sourceMappingURL=HEALPixProjection.d.ts.map