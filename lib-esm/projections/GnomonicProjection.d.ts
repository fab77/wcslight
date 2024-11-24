/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
import { AbstractProjection } from './AbstractProjection.js';
import { ImagePixel } from '../model/ImagePixel.js';
import { FITSHeader } from 'jsfitsio';
import { FITSParsed } from 'jsfitsio';
import { Point } from '../model/Point.js';
export declare class GnomonicProjection extends AbstractProjection {
    _minra: number;
    _mindec: number;
    _pxmatrix: any;
    _fitsheader: FITSHeader[];
    _inflie: string;
    _craDeg: number;
    _cdecDeg: number;
    _pxsize1: number;
    _pxsize2: number;
    _pxvalues: Map<number, Array<Uint8Array>>;
    _minphysicalval: number;
    _maxphysicalval: number;
    _wcsname: string;
    constructor(infile?: string);
    get fitsUsed(): String[];
    initFromFile(infile: string): Promise<FITSParsed>;
    extractPhysicalValues(fits: FITSParsed): number[][];
    prepareFITSHeader(fitsHeaderParams: FITSHeader): FITSHeader[];
    getFITSHeader(): FITSHeader[];
    getCommonFitsHeaderParams(): FITSHeader;
    getPixValues(inputPixelsList: ImagePixel[]): Promise<Uint8Array>;
    setPxsValue(values: Uint8Array, fitsHeaderParams: FITSHeader): Map<number, Array<Uint8Array>>;
    getImageRADecList(center: Point, radius: number, pxsize: number): Array<[number, number]>;
    pix2world(i: number, j: number): Point;
    world2pix(radeclist: number[][]): ImagePixel[];
}
//# sourceMappingURL=GnomonicProjection.d.ts.map