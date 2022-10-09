import { FITSHeader } from 'jsfitsio';
import { FITSParsed } from 'jsfitsio';
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
    abstract initFromFile(fitsfilepath?: string, hipsURI?: string, pxsize?: number, order?: number): Promise<FITSParsed | undefined>;
    abstract prepareFITSHeader(fitsHeaderParams: FITSHeader): FITSHeader[];
    abstract getFITSHeader(): FITSHeader[];
    abstract getCommonFitsHeaderParams(): FITSHeader;
    abstract extractPhysicalValues(fits: FITSParsed): number[][];
    abstract getPixValues(inputPixelsList: ImagePixel[]): Promise<Uint8Array | undefined>;
    abstract computeSquaredNaxes(d: number, ps: number): void;
    abstract setPxsValue(values: Uint8Array, fitsHeaderParams: FITSHeader): Map<number, Array<Uint8Array>>;
    abstract getImageRADecList(center: Point, radius: number, pxsize: number): Array<[number, number]>;
    abstract pix2world(i: number, j: number): Point;
    abstract world2pix(radeclist: number[][]): ImagePixel[];
}
//# sourceMappingURL=AbstractProjection.d.ts.map