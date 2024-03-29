import { FITSHeader } from "jsfitsio";
import { AbstractProjection } from "../projections/AbstractProjection.js";
export interface CutoutResult {
    fitsheader: FITSHeader[];
    fitsdata: Map<number, Uint8Array[]>;
    inproj: AbstractProjection;
    outproj: AbstractProjection;
    fitsused: String[];
}
//# sourceMappingURL=CutoutResult.d.ts.map