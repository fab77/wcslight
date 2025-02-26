/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
import { FITSHeaderManager, FITSParsed } from 'jsfitsio';
import { AbstractProjection } from './AbstractProjection.js';
import { ImagePixel } from '../model/ImagePixel.js';
import { Point } from '../model/Point.js';
export declare class MercatorProjection extends AbstractProjection {
    _minra: number;
    _mindec: number;
    _fitsheader: FITSHeaderManager[];
    _infile: string;
    _craDeg: number;
    _cdecDeg: number;
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
    prepareFITSHeader(fitsHeaderParams: FITSHeaderManager): FITSHeaderManager[];
    getFITSHeader(): FITSHeaderManager[];
    getCommonFitsHeaderParams(): FITSHeaderManager;
    get fitsUsed(): String[];
    getPixValues(inputPixelsList: ImagePixel[]): Promise<Uint8Array>;
    setPxsValue(values: Uint8Array, fitsHeaderParams: FITSHeaderManager): Map<number, Array<Uint8Array>>;
    getImageRADecList(center: Point, radius: number, pxsize: number): Array<[number, number]>;
    /** TODO !!! check and handle RA passing through 360-0 */
    pix2world(i: number, j: number): Point;
    world2pix(radeclist: number[][]): ImagePixel[];
}
//# sourceMappingURL=MercatorProjection.d.ts.map