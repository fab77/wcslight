import { FITSHeaderManager, FITSParsed } from "jsfitsio";
import { HiPSProp } from "./HiPSProp.js";
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
    private static NPIX;
    constructor(fitsParsed: FITSParsed | null, tileno: number | null, hipsProp: HiPSProp | null);
    initFromUint8Array(raDecList: [number, number][], originalValues: Uint8Array, fitsHeaderParams: FITSHeaderManager): void;
    initFromFITSParsed(fitsParsed: FITSParsed): void;
    getTileno(): number;
    private computeMinMax;
    static downloadFITSFile(path: string): Promise<FITSParsed | null>;
    getFITS(): FITSParsed;
    private setPayload;
    private addMandatoryItemToHeader;
    private addItemToHeader;
    private setHeader;
}
//# sourceMappingURL=HiPSFITS.d.ts.map