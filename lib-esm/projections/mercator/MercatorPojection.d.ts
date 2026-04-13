/**
 * Mercator projection (RA---MER / DEC--MER)
 *
 * Implements AbstractProjection with Mercator forward/inverse transforms.
 * Vertical coordinate is Mercator-projected Y in degrees.
 *
 * @author Fabrizio
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
    _wcsname: string;
    constructor();
    /** ----------------------------------------------------------------------
     * Required implementations of AbstractProjection
     * ---------------------------------------------------------------------- */
    initFromFile(infile: string): Promise<FITSParsed>;
    getBytePerValue(): number;
    getFITSHeader(): FITSHeaderManager;
    getCommonFitsHeaderParams(): FITSHeaderManager;
    getImageRADecList(center: Point, radius: number, pxsize: number, naxisWidth: number): TilesRaDecList2;
    computeNaxisWidth(radius: number, pxsize: number): number;
    pix2world(i: number, j: number, pxsize: number, minra: number, mindec: number): Point;
    world2pix(raDecList: TilesRaDecList2): TilesRaDecList2;
    generateFITSFile(pixelAngSize: number, BITPIX: number, TILE_WIDTH: number, BLANK: number, BZERO: number, BSCALE: number, cRA: number, cDec: number, minValue: number, maxValue: number, raDecWithValues: TilesRaDecList2): FITS;
    /** ----------------------------------------------------------------------
     * FITS header & data handling
     * ---------------------------------------------------------------------- */
    prepareHeader(pixelAngSize: number, BITPIX: number, TILE_WIDTH: number, BLANK: number, BZERO: number, BSCALE: number, cRA: number, cDec: number, minValue: number, maxValue: number): FITSHeaderManager;
    setPixelValues(raDecList: TilesRaDecList2, header: FITSHeaderManager): FITS;
}
//# sourceMappingURL=MercatorPojection.d.ts.map