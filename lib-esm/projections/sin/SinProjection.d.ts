/**
 * SIN (Slant/Orthographic) projection for FITS WCS ('SIN')
 * CTYPE1='RA---SIN', CTYPE2='DEC--SIN'
 *
 * Piano in "gradi proiettivi": convertiamo (x_rad,y_rad) -> (x_deg,y_deg) con RAD2DEG
 * così che CDELT resti in deg/pixel come nelle altre proiezioni.
 */
import { FITSHeaderManager, FITSParsed } from 'jsfitsio';
import { AbstractProjection } from '../AbstractProjection.js';
import { Point } from '../../model/Point.js';
import { TilesRaDecList2 } from '../hips/TilesRaDecList2.js';
import { FITS } from '../../model/FITS.js';
export declare class SinProjection extends AbstractProjection {
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
    _wcsname: string;
    constructor();
    initFromFile(infile: string): Promise<FITSParsed>;
    getBytePerValue(): number;
    getFITSHeader(): FITSHeaderManager;
    getCommonFitsHeaderParams(): FITSHeaderManager;
    getImageRADecList(center: Point, radius: number, pxsize: number, naxisWidth: number): TilesRaDecList2;
    computeNaxisWidth(radius: number, pxsize: number): number;
    pix2world(i: number, j: number, pxsize: number, minPlaneXdeg: number, minPlaneYdeg: number): Point;
    world2pix(raDecList: TilesRaDecList2): TilesRaDecList2;
    generateFITSFile(pixelAngSize: number, BITPIX: number, TILE_WIDTH: number, BLANK: number, BZERO: number, BSCALE: number, cRA: number, cDec: number, minValue: number, maxValue: number, raDecWithValues: TilesRaDecList2): FITS;
    prepareHeader(pixelAngSize: number, BITPIX: number, TILE_WIDTH: number, BLANK: number, BZERO: number, BSCALE: number, cRA: number, cDec: number, minValue: number, maxValue: number): FITSHeaderManager;
    setPixelValues(raDecList: TilesRaDecList2, header: FITSHeaderManager): FITS;
}
//# sourceMappingURL=SinProjection.d.ts.map