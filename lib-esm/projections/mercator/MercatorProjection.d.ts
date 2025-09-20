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
import { FITS } from '../../model/FITS.js';
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
    _wcsname: string;
    constructor();
    initFromFile(infile: string): Promise<FITSParsed>;
    getBytePerValue(): number;
    extractPhysicalValues(fits: FITSParsed): number[][];
    prepareHeader(pixelAngSize: number, BITPIX: number, TILE_WIDTH: number, BLANK: number, BZERO: number, BSCALE: number, cRA: number, cDec: number, minValue: number, maxValue: number): FITSHeaderManager;
    getFITSHeader(): FITSHeaderManager;
    getCommonFitsHeaderParams(): FITSHeaderManager;
    computeNaxisWidth(radius: number, pxsize: number): number;
    getImageRADecList(center: Point, radius: number, pxsize: number, naxisWidth: number): TilesRaDecList2;
    /** TODO !!! check and handle RA passing through 360-0 */
    pix2world(i: number, j: number): Point;
    setPixelValues(raDecList: TilesRaDecList2, header: FITSHeaderManager): FITS;
    generateFITSFile(pixelAngSize: number, BITPIX: number, TILE_WIDTH: number, BLANK: number, BZERO: number, BSCALE: number, cRA: number, cDec: number, minValue: number, maxValue: number, raDecWithValues: TilesRaDecList2): FITS;
    world2pix(raDecList: TilesRaDecList2): TilesRaDecList2;
}
//# sourceMappingURL=MercatorProjection.d.ts.map