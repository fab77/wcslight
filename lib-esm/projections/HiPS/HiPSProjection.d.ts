import { FITSList } from "./FITSList.js";
import { Point } from "../../model/Point.js";
import { Healpix } from "healpixjs";
import { FITSHeaderManager } from "jsfitsio";
import { TilesRaDecList2 } from "./TilesRaDecList2.js";
export declare class HiPSProjection {
    private baseURL;
    private healpix;
    private hipsProp;
    constructor(baseHiPSPath: string);
    init(): Promise<void>;
    private parsePropertyFile;
    static getImageRADecList(center: Point, radiusDeg: number, pixelAngSize: number, TILE_WIDTH: number): TilesRaDecList2 | null;
    private static _xyGridCache;
    static pix2world(i: number, j: number, tileno: number, healpix: Healpix, TILE_WIDTH: number): Point | null;
    static getFITSFiles(tilesRaDecList: TilesRaDecList2, fitsHeaderParams: FITSHeaderManager, pixelAngSize: number, TILE_WIDTH: number): FITSList;
    static world2pix(radeclist: TilesRaDecList2, hipsOrder: number, isGalactic: boolean, TILE_WIDTH: number, baseHiPSURL: string): Promise<TilesRaDecList2 | null>;
    static convertToGalactic(radeclist: TilesRaDecList2): void;
    static getPixelValues(raDecList: TilesRaDecList2, baseHiPSURL: string, hipsOrder: number): Promise<TilesRaDecList2 | null>;
}
//# sourceMappingURL=HiPSProjection.d.ts.map