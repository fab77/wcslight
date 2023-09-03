/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
import { FITSHeader } from 'jsfitsio';
import { FITSParsed } from 'jsfitsio';
import { AbstractProjection } from './AbstractProjection.js';
import { ImagePixel } from '../model/ImagePixel.js';
import { Point } from '../model/Point.js';
export declare class MercatorProjection implements AbstractProjection {
    _minra: number;
    _mindec: number;
    _naxis1: number;
    _naxis2: number;
    _fitsheader: FITSHeader[];
    _infile: string;
    _ctype1: string;
    _ctype2: string;
    _craDeg: number;
    _cdecDeg: number;
    _pxsize: number;
    _pxsize1: number;
    _pxsize2: number;
    _pxvalues: Map<number, Array<Uint8Array>>;
    _minphysicalval: number;
    _maxphysicalval: number;
    _wcsname: string;
    _fitsUsed: String[];
    constructor();
    initFromFile(infile: string): Promise<FITSParsed>;
    extractPhysicalValues(fits: FITSParsed): number[][];
    prepareFITSHeader(fitsHeaderParams: FITSHeader): FITSHeader[];
    getFITSHeader(): FITSHeader[];
    getCommonFitsHeaderParams(): FITSHeader;
    get fitsUsed(): String[];
    getPixValues(inputPixelsList: ImagePixel[]): Promise<Uint8Array>;
    computeSquaredNaxes(d: number, ps: number): void;
    setPxsValue(values: Uint8Array, fitsHeaderParams: FITSHeader): Map<number, Array<Uint8Array>>;
    getImageRADecList(center: Point, radius: number, pxsize: number): Array<[number, number]>;
    /** TODO !!! check and handle RA passing through 360-0 */
    pix2world(i: number, j: number): Point;
    world2pix(radeclist: number[][]): ImagePixel[];
}
//# sourceMappingURL=MercatorProjection.d.ts.map