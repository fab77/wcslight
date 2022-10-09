import { FITSHeader } from 'jsfitsio';
import { FITSParsed } from 'jsfitsio';
// import { AstroCoords } from "src/model/AstroCoords";
import { ImagePixel } from "../model/ImagePixel.js";
import {Point} from "../model/Point.js";

/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

export abstract class AbstractProjection {

    // constructor() { }

    public abstract initFromFile(fitsfilepath?: string, hipsURI?: string, pxsize?: number, order?: number): Promise<FITSParsed | undefined>;

    public abstract prepareFITSHeader(fitsHeaderParams: FITSHeader): FITSHeader[];

    public abstract getFITSHeader(): FITSHeader[];

    public abstract getCommonFitsHeaderParams(): FITSHeader;

    public abstract extractPhysicalValues(fits: FITSParsed): number[][];

    public abstract getPixValues(inputPixelsList: ImagePixel[]): Promise<Uint8Array | undefined>;

    public abstract computeSquaredNaxes(d: number, ps: number): void;

    // protected abstract prepareCommonHeader(fitsheaderlist: FITSHeader[]): void;

    public abstract setPxsValue(values: Uint8Array, fitsHeaderParams: FITSHeader): Map<number, Array<Uint8Array>>;

    public abstract getImageRADecList(center: Point, radius: number, pxsize: number): Array<[number, number]>;

    public abstract pix2world(i: number, j: number): Point;

    // public abstract world2pix(radeclist: number[][]): Promise<ImagePixel[]>
    public abstract world2pix(radeclist: number[][]): ImagePixel[]

}
