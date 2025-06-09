import { FITSList } from "./FITSList.js";
import { Point } from "../../model/Point.js";
import { Healpix } from "healpixjs";
import { FITSHeaderManager } from "jsfitsio";
import { TilesRaDecList } from "./TilesRaDecList.js";
import { ImagePixel } from "../../model/ImagePixel.js";
export declare class HiPSProj {
    private baseURL;
    private healpix;
    private hipsProp;
    constructor(baseHiPSPath: string);
    init(): Promise<void>;
    private parsePropertyFile;
    static getImageRADecList(center: Point, radiusDeg: number, pixelAngSize: number, TILE_WIDTH?: number): TilesRaDecList | null;
    static pix2world(i: number, j: number, tileno: number, healpix: Healpix, TILE_WIDTH: number): Point | null;
    static getFITSFiles(inputValues: Uint8Array, tilesRaDecList: TilesRaDecList, fitsHeaderParams: FITSHeaderManager, pixelAngSize: number, TILE_WIDTH?: number): FITSList;
    static world2pix(radeclist: number[][], hipsOrder: number, isGalactic: boolean, TILE_WIDTH?: number): ImagePixel[];
    static convertToGalactic(radeclist: number[][]): number[][];
    static getPixelValues(inputPixelsList: ImagePixel[], baseHiPSURL: string, hipsOrder: number, TILE_WIDTH?: number): Promise<Uint8Array | null>;
}
//# sourceMappingURL=HiPSProj.d.ts.map