/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
import { FITSHeaderManager, FITSParsed } from 'jsfitsio';
import { AbstractProjection } from '../AbstractProjection.js';
import { Point } from '../../model/Point.js';
import { TilesRaDecList2 } from '../hips/TilesRaDecList2.js';
export declare class MercatorProjection extends AbstractProjection {
    minra: number;
    mindec: number;
    naxis1: number;
    naxis2: number;
    bitpix: number;
    fitsheader: FITSHeaderManager;
    pxvalues: Array<Uint8Array>;
    CTYPE1: string;
    CTYPE2: string;
    craDeg: number;
    cdecDeg: number;
    pxsize: number;
    pxsize1: number;
    pxsize2: number;
    _minphysicalval: number;
    _maxphysicalval: number;
    _wcsname: string;
    constructor();
    initFromFile(infile: string): Promise<FITSParsed>;
    getBytePerValue(): number;
    extractPhysicalValues(fits: FITSParsed): number[][];
    computeHeader(pxsize: number, bitpix: number, scale?: number, zero?: number, blank?: number): FITSHeaderManager;
    static prepareHeader(radius: number, pixelAngSize: number, bitpix: number, bscale?: number, bzero?: number): void;
    prepareFITSHeader(fitsHeaderParams: FITSHeaderManager): FITSHeaderManager;
    getFITSHeader(): FITSHeaderManager;
    getCommonFitsHeaderParams(): FITSHeaderManager;
    setPxsValue(raDecList: TilesRaDecList2, bitpix: number, scale?: number, zero?: number): TilesRaDecList2;
    getImageRADecList(center: Point, radius: number, pxsize: number): TilesRaDecList2;
    /** TODO !!! check and handle RA passing through 360-0 */
    pix2world(i: number, j: number): Point;
    world2pix(raDeclist: TilesRaDecList2): TilesRaDecList2;
}
//# sourceMappingURL=MercatorProjection.d.ts.map