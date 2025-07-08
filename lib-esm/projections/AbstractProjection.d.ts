import { FITSHeaderManager } from "jsfitsio";
import { Point } from "../model/Point.js";
import { TilesRaDecList2 } from "./hips/TilesRaDecList2.js";
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
    abstract setPxsValue(values: TilesRaDecList2, bitpix: number, scale: number, zero: number): TilesRaDecList2;
    abstract getImageRADecList(center: Point, radius: number, pxsize: number): TilesRaDecList2;
    abstract pix2world(i: number, j: number): Point;
    abstract world2pix(radeclist: TilesRaDecList2): TilesRaDecList2;
}
//# sourceMappingURL=AbstractProjection.d.ts.map