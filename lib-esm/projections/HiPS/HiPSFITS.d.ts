import { FITSHeaderManager, FITSParsed } from "jsfitsio";
import { HiPSProperties } from "./HiPSProperties.js";
import { ImagePixel } from "./ImagePixel.js";
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
    constructor(fitsParsed: FITSParsed | null, tileno: number | null, hipsProp: HiPSProperties | null);
    initFromUint8Array(imagePixelList: ImagePixel[], fitsHeaderParams: FITSHeaderManager, tileWidth: number): void;
    getHeader(): FITSHeaderManager;
    getPayload(): Uint8Array<ArrayBufferLike>[];
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