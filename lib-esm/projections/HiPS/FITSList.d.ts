import { HiPSFITS } from "./HiPSFITS.js";
export declare class FITSList {
    private fitslist;
    constructor();
    getFITSList(): Map<number, HiPSFITS>;
    getFITS(tileno: number): HiPSFITS | null;
    addFITSByURL(url: string): void;
    addFITS(fits: HiPSFITS): void;
}
//# sourceMappingURL=FITSList.d.ts.map