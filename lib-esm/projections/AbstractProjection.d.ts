import { FITSHeaderManager } from "jsfitsio";
import { ImagePixel } from "../model/ImagePixel.js";
import { Point } from "../model/Point.js";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
export declare abstract class AbstractProjection {
    abstract getFITSHeader(): FITSHeaderManager[];
    abstract getCommonFitsHeaderParams(): FITSHeaderManager;
    abstract getPixValues(inputPixelsList: ImagePixel[]): Promise<Uint8Array | undefined>;
    abstract setPxsValue(values: Uint8Array, fitsHeaderParams: FITSHeaderManager): Map<number, Array<Uint8Array>>;
    abstract getImageRADecList(center: Point, radius: number, pxsize: number): Array<[number, number]>;
    abstract pix2world(i: number, j: number): Point;
    abstract get fitsUsed(): String[];
    abstract world2pix(radeclist: number[][]): ImagePixel[];
}
//# sourceMappingURL=AbstractProjection.d.ts.map