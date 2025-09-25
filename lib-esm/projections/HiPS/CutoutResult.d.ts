import { FITS } from "../../model/FITS.js";
import { AbstractProjection } from "../AbstractProjection.js";
import { RADecMinMaxCentral } from "../RADecMinMaxCentral.js";
export declare class CutoutResult {
    fits: FITS;
    fitsused: string[];
    projection: AbstractProjection;
    raDecMinMaxCentral: RADecMinMaxCentral;
    pxsize: number;
    constructor(fits: FITS, fitsused: string[], projection: AbstractProjection, raDecMinMaxCentral: RADecMinMaxCentral, pxsize: number);
}
//# sourceMappingURL=CutoutResult.d.ts.map