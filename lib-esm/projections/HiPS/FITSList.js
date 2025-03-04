import { HiPSFITS } from "./HiPSFITS.js";
export class FITSList {
    constructor() {
        this.fitslist = new Map();
    }
    getFITSList() {
        return this.fitslist;
    }
    getFITS(tileno) {
        const fits = this.fitslist.get(tileno);
        return fits === undefined ? null : fits;
    }
    addFITSByURL(url) {
        const fits = new HiPSFITS(url, null, null, null);
        this.fitslist.set(fits.getTileno(), fits);
    }
    addFITS(fits) {
        const tileno = fits.getTileno();
        this.fitslist.set(tileno, fits);
    }
}
//# sourceMappingURL=FITSList.js.map