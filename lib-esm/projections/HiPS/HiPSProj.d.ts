import { FITSList } from "./FITSList.js";
import { Point } from "../../model/Point.js";
import { FITSHeaderManager } from "jsfitsio";
import { TilesRaDecList } from "./TilesRaDecList.js";
export declare class HiPSProj {
    private ctype1;
    private ctype2;
    private fitsList;
    private baseURL;
    private healpix;
    private hipsProp;
    constructor(baseHiPSPath: string);
    init(): Promise<void>;
    private parsePropertyFile;
    getImageRADecList(center: Point, radiusDeg: number): TilesRaDecList | null;
    pix2world(i: number, j: number, tileno: number): Point | null;
    setPxsValue(inputValues: Uint8Array, tilesRaDecList: TilesRaDecList, fitsHeaderParams: FITSHeaderManager): FITSList;
}
//# sourceMappingURL=HiPSProj.d.ts.map