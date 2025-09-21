import { FITSParser } from "jsfitsio";
import { HiPSFITS } from "./HiPSFITS.js";
export class FITSList {
    fitslist = new Map();
    constructor() { }
    getFITSList() {
        return this.fitslist;
    }
    getFITS(tileno) {
        const fits = this.fitslist.get(tileno);
        return fits === undefined ? null : fits;
    }
    async addFITSByURL(url) {
        const fits = await FITSParser.loadFITS(url);
        const hipsFits = new HiPSFITS(fits, null, null);
        this.fitslist.set(hipsFits.getTileno(), hipsFits);
    }
    addFITS(fits) {
        const tileno = fits.getTileno();
        this.fitslist.set(tileno, fits);
    }
}
//# sourceMappingURL=FITSList.js.map