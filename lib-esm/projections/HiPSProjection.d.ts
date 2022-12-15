import { FITSHeader } from 'jsfitsio';
import { FITSParsed } from 'jsfitsio';
import { Healpix } from "healpixjs";
import { AbstractProjection } from './AbstractProjection.js';
import { HEALPixXYSpace } from '../model/HEALPixXYSpace.js';
import { ImagePixel } from '../model/ImagePixel.js';
import { Point } from '../model/Point.js';
export declare class HiPSProjection implements AbstractProjection {
    _naxis1: number;
    _naxis2: number;
    _pixno: number;
    _tileslist: number[];
    _hp: Healpix;
    _fh_common: FITSHeader;
    _ctype1: string;
    _ctype2: string;
    _wcsname: string;
    _hipsBaseURI: string;
    _pxsize: number;
    _fitsheaderlist: FITSHeader[];
    _pxvalues: Map<number, Array<Uint8Array>>;
    _xyGridProj: HEALPixXYSpace;
    _norder: number;
    _nside: number;
    _radeclist: Array<[number, number]>;
    _HIPS_TILE_WIDTH: number;
    _fitsUsed: String[];
    /**
     *
     * * ex with single local file:
     * let hp = new HiPSProjection('/mylocaldir/myfile.fits', null, null, null);
     * hp.initFromFile()
     *
     * * ex with single remote file:
     * let hp = new HiPSProjection('http://<hips-server>/Norder7/DirN/NpixXYZ.fits', null, null, null);
     * hp.initFromFile()
     *
     * * ex with HiPS server base local dir:
     * let hp = new HiPSProjection(null, <hips-local-root-dir>, pxsize, order);
     * hp.initFromBaseHiPSDir()
     *
     * * ex with HiPS server base URL:
     * let hp = new HiPSProjection(null, 'http://<hips-server>/<hips-root-dir>', pxsize, order);
     * hp.initFromBaseHiPSDir()
     *
     */
    constructor();
    parsePropertiesFile(baseUrl: string): Promise<any>;
    initFromFile(fitsfilepath: string): Promise<FITSParsed>;
    initFromHiPSLocationAndPxSize(baseUrl: string, pxsize: number): Promise<void>;
    initFromHiPSLocationAndOrder(baseUrl: string, order: number): Promise<void>;
    init(order: number): void;
    prepareFITSHeader(fitsHeaderParams: FITSHeader): FITSHeader[];
    getFITSHeader(): FITSHeader[];
    getCommonFitsHeaderParams(): FITSHeader;
    extractPhysicalValues(fits: FITSParsed): number[][];
    getFITSFiles(inputPixelsList: ImagePixel[], destPath: string): Promise<Map<string, FITSParsed>>;
    get fitsUsed(): String[];
    getPixValues(inputPixelsList: ImagePixel[]): Promise<Uint8Array | undefined>;
    computeSquaredNaxes(d: number, ps: number): void;
    prepareCommonHeader(fitsheaderlist: (FITSHeader | undefined)[]): void;
    setPxsValue(values: Uint8Array, fitsHeaderParams: FITSHeader): Map<number, Array<Uint8Array>>;
    getImageRADecList(center: Point, radiusDeg: number): Array<[number, number]>;
    pix2world(i: number, j: number): Point;
    world2pix(radeclist: number[][]): ImagePixel[];
}
//# sourceMappingURL=HiPSProjection.d.ts.map