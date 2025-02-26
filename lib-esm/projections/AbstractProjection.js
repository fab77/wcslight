import { FITSHeaderManager, FITSHeaderItem } from "jsfitsio";
import { FITS } from "../model/FITS.js";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
export class AbstractProjection {
    constructor(ctype1, ctype2, naxis1 = 0, naxis2 = 0, pxsize = 0) {
        this._ctype1 = ctype1;
        this._ctype2 = ctype2;
        this._naxis1 = naxis1;
        this._naxis2 = naxis2;
        this._pxsize = pxsize;
    }
    get naxis1() {
        return this._naxis1;
    }
    set naxis1(value) {
        this._naxis1 = value;
    }
    get naxis2() {
        return this._naxis2;
    }
    set naxis2(value) {
        this._naxis2 = value;
    }
    get pxsize() {
        return this._pxsize;
    }
    set pxsize(value) {
        this._pxsize = value;
    }
    get ctype1() {
        return this._ctype1;
    }
    set ctype1(value) {
        this._ctype1 = value;
    }
    get ctype2() {
        return this._ctype2;
    }
    set ctype2(value) {
        this._ctype2 = value;
    }
    // public abstract generateFITSWithNaN(): FITS;
    generateFITSWithNaN() {
        if (!this.naxis1 || !this.naxis2) {
            throw new Error("NAXIS1 and NAXIS2 must be initialized before generating FITS.");
        }
        let fitsheaderList = [];
        let fitsheader = new FITSHeaderManager();
        fitsheader.insert(new FITSHeaderItem("NAXIS1", this.naxis1));
        fitsheader.insert(new FITSHeaderItem("NAXIS2", this.naxis2));
        fitsheader.insert(new FITSHeaderItem("NAXIS", 2));
        fitsheader.insert(new FITSHeaderItem("BITPIX", "-64"));
        fitsheader.insert(new FITSHeaderItem("SIMPLE", "T"));
        fitsheader.insert(new FITSHeaderItem("BSCALE", 1));
        fitsheader.insert(new FITSHeaderItem("BZERO", 0));
        fitsheader.insert(new FITSHeaderItem("CTYPE1", this.ctype1));
        fitsheader.insert(new FITSHeaderItem("CTYPE2", this.ctype2));
        fitsheader.insert(new FITSHeaderItem("CDELT1", this.pxsize)); // ??? Pixel spacing along axis 1 ???
        fitsheader.insert(new FITSHeaderItem("CDELT2", this.pxsize)); // ??? Pixel spacing along axis 2 ???
        fitsheader.insert(new FITSHeaderItem("CRPIX1", this.naxis1 / 2)); // central/reference pixel i along naxis1
        fitsheader.insert(new FITSHeaderItem("CRPIX2", this.naxis2 / 2)); // central/reference pixel j along naxis2
        fitsheader.insert(new FITSHeaderItem("CRVAL1", NaN)); // central/reference pixel RA
        fitsheader.insert(new FITSHeaderItem("CRVAL2", NaN)); // central/reference pixel Dec
        fitsheader.insert(new FITSHeaderItem("ORIGIN", "'WCSLight v.0.x'"));
        fitsheader.insert(new FITSHeaderItem("COMMENT", "'WCSLight v0.x developed by F.Giordano and Y.Ascasibar'"));
        fitsheader.insert(new FITSHeaderItem("END"));
        fitsheaderList.push(fitsheader);
        let bytesXelem = 8;
        // why not usign a simple arrays?
        let pv = new Map();
        pv.set(0, new Array(this.naxis2));
        pv.get(0);
        for (let r = 0; r < this.naxis2; r++) {
            pv.get(0)[r] = new Uint8Array(this.naxis1 * bytesXelem);
            pv.get(0)[r].fill(255);
        }
        const fitsNan = new FITS(fitsheaderList, pv);
        return fitsNan;
    }
    computeSquaredNaxes(d, ps) {
        // first approximation to be checked
        this._naxis1 = Math.ceil(d / ps);
        this._naxis2 = this._naxis1;
        this._pxsize = ps;
    }
}
//# sourceMappingURL=AbstractProjection.js.map