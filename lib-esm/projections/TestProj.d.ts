import { FITSHeader } from 'jsfitsio';
import { FITSParsed } from 'jsfitsio';
import { ImagePixel } from '../model/ImagePixel.js';
import { AbstractProjection } from './AbstractProjection.js';
import { Point } from '../model/Point.js';
export declare class TestProj extends AbstractProjection {
    _minra: number;
    _mindec: number;
    _fitsheader: FITSHeader[];
    _infile: string;
    _craDeg: number;
    _cdecDeg: number;
    _pxsize1: number;
    _pxsize2: number;
    _pxvalues: Map<number, Array<Uint8Array>>;
    _minphysicalval: number;
    _maxphysicalval: number;
    _wcsname: string;
    constructor();
    get fitsUsed(): String[];
    initFromFile(fitsfilepath?: string, hipsURI?: string, pxsize?: number, order?: number): Promise<FITSParsed>;
    prepareFITSHeader(fitsHeaderParams: FITSHeader): FITSHeader[];
    getFITSHeader(): FITSHeader[];
    getCommonFitsHeaderParams(): FITSHeader;
    extractPhysicalValues(fits: FITSParsed): number[][];
    getPixValues(inputPixelsList: ImagePixel[]): Promise<Uint8Array>;
    computeSquaredNaxes(d: number, ps: number): void;
    setPxsValue(values: Uint8Array, fitsHeaderParams: FITSHeader): Map<number, Uint8Array[]>;
    getImageRADecList(center: Point, radius: number, pxsize: number): Array<[number, number]>;
    pix2world(i: number, j: number): Point;
    world2pix(radeclist: number[][]): ImagePixel[];
}
//# sourceMappingURL=TestProj.d.ts.map