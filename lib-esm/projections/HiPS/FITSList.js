var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FITSParser } from "jsfitsio";
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
        return __awaiter(this, void 0, void 0, function* () {
            const fits = yield FITSParser.loadFITS(url);
            const hipsFits = new HiPSFITS(fits, null, null);
            this.fitslist.set(hipsFits.getTileno(), hipsFits);
        });
    }
    addFITS(fits) {
        const tileno = fits.getTileno();
        this.fitslist.set(tileno, fits);
    }
}
//# sourceMappingURL=FITSList.js.map