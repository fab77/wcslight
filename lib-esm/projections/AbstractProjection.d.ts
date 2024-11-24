import { FITSHeader } from "jsfitsio";
import { FITSParsed } from "jsfitsio";
import { ImagePixel } from "../model/ImagePixel.js";
import { Point } from "../model/Point.js";
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
    private _naxis1;
    private _naxis2;
    private _pxsize;
    private _ctype1;
    private _ctype2;
    constructor(ctype1: string, ctype2: string, naxis1?: number, naxis2?: number, pxsize?: number);
    protected get naxis1(): number;
    protected set naxis1(value: number);
    protected get naxis2(): number;
    protected set naxis2(value: number);
    protected get pxsize(): number;
    protected set pxsize(value: number);
    protected get ctype1(): string;
    protected set ctype1(value: string);
    protected get ctype2(): string;
    protected set ctype2(value: string);
    abstract initFromFile(fitsfilepath?: string, hipsURI?: string, pxsize?: number, order?: number): Promise<FITSParsed | undefined>;
    abstract prepareFITSHeader(fitsHeaderParams: FITSHeader): FITSHeader[];
    abstract getFITSHeader(): FITSHeader[];
    abstract getCommonFitsHeaderParams(): FITSHeader;
    abstract extractPhysicalValues(fits: FITSParsed): number[][];
    abstract getPixValues(inputPixelsList: ImagePixel[]): Promise<Uint8Array | undefined>;
    abstract setPxsValue(values: Uint8Array, fitsHeaderParams: FITSHeader): Map<number, Array<Uint8Array>>;
    abstract getImageRADecList(center: Point, radius: number, pxsize: number): Array<[number, number]>;
    abstract pix2world(i: number, j: number): Point;
    abstract get fitsUsed(): String[];
    abstract world2pix(radeclist: number[][]): ImagePixel[];
    generateFITSWithNaN(): FITS;
    computeSquaredNaxes(d: number, ps: number): void;
}
//# sourceMappingURL=AbstractProjection.d.ts.map