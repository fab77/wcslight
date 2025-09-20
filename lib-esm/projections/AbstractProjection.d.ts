import { FITSHeaderManager } from "jsfitsio";
import { Point } from "../model/Point.js";
import { TilesRaDecList2 } from "./hips/TilesRaDecList2.js";
import { FITS } from "../model/FITS.js";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
export declare abstract class AbstractProjection {
    abstract getFITSHeader(): FITSHeaderManager;
    abstract getCommonFitsHeaderParams(): FITSHeaderManager;
    abstract setPixelValues(values: TilesRaDecList2, header: FITSHeaderManager): FITS;
    abstract getImageRADecList(center: Point, radius: number, pxsize: number, naxisWidth: number): TilesRaDecList2;
    abstract pix2world(i: number, j: number): Point;
    abstract world2pix(radeclist: TilesRaDecList2): TilesRaDecList2;
    abstract computeNaxisWidth(radius: number, pxsize: number): number;
    abstract generateFITSFile(pixelAngSize: number, BITPIX: number, TILE_WIDTH: number, BLANK: number, BZERO: number, BSCALE: number, cRA: number, cDec: number, minValue: number, maxValue: number, raDecWithValues: TilesRaDecList2): FITS;
}
//# sourceMappingURL=AbstractProjection.d.ts.map