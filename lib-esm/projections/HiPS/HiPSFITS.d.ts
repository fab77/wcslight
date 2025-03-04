import { FITSHeaderManager, FITSParsed } from "jsfitsio";
import { HiPSProp } from "./HiPSProp.js";
import { Healpix } from "healpixjs";
export declare class HiPSFITS {
    private payload;
    private header;
    private tileno;
    private order;
    private tileWidth;
    private healpix;
    private intermediateXYGrid;
    private min;
    private max;
    private static CTYPE1;
    private static CTYPE2;
    constructor(fitsParsed: FITSParsed | null, tileno: number | null, hipsProp: HiPSProp | null, healpix: Healpix | null);
    getTileno(): number;
    initFromFile(fitsParsed: FITSParsed): void;
    static downloadFITSFile(path: string): Promise<FITSParsed | null>;
    getFITS(): FITSParsed;
    setPayload(raDecList: [number, number][], originalValues: Uint8Array, fitsHeaderParams: FITSHeaderManager): void;
    private addMandatoryItemToHeader;
    private addItemToHeader;
    setHeader(fitsHeaderParams: FITSHeaderManager): void;
}
//# sourceMappingURL=HiPSFITS.d.ts.map