import { FITSParser } from "jsfitsio";
import { HiPSFITS } from "./HiPSFITS.js";

export class FITSList {
    private fitslist: Map<number, HiPSFITS> = new Map();

    constructor() {}

    getFITSList(): Map<number, HiPSFITS> {
        return this.fitslist;
    }

    getFITS(tileno: number): HiPSFITS | null {
        const fits = this.fitslist.get(tileno);
        return fits === undefined ? null : fits;
    }

    async addFITSByURL(url: string) {
        const fitsFile = await FITSParser.loadFITSFile(url);
        const primaryHDU = fitsFile?.primaryHDU;

        if (!primaryHDU) {
            throw new Error(`Unable to load FITS file: ${url}`);
        }

        const hipsFits = new HiPSFITS(primaryHDU, null, null);

        this.fitslist.set(hipsFits.getTileno(), hipsFits);
    }

    addFITS(fits: HiPSFITS) {
        const tileno = fits.getTileno();
        this.fitslist.set(tileno, fits);
    }
}