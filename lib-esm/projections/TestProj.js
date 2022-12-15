// import { FITSParser } from 'fitsparser/FITSParser-node';
// import { FITSHeader } from 'fitsparser/model/FITSHeader';
// import { FITSHeaderItem } from 'fitsparser/model/FITSHeaderItem';
// import { FITSParsed } from 'fitsparser/model/FITSParsed';
import { FITSParser } from 'jsfitsio';
import { FITSHeader } from 'jsfitsio';
import { FITSHeaderItem } from 'jsfitsio';
export class TestProj {
    constructor() {
        this._wcsname = "MER"; // TODO check WCS standard and create ENUM
        this._ctype1 = "RA---MER";
        this._ctype2 = "DEC--MER";
        this._pxvalues = new Map();
        const fh = new FITSHeader();
        const fp = new FITSParser("./notexistent/");
        const fhi = new FITSHeaderItem("mykey", "myvalue", "mycomment");
    }
    get fitsUsed() {
        throw new Error('Method not implemented.');
    }
    initFromFile(fitsfilepath, hipsURI, pxsize, order) {
        throw new Error('Method not implemented.');
    }
    prepareFITSHeader(fitsHeaderParams) {
        throw new Error('Method not implemented.');
    }
    getFITSHeader() {
        throw new Error('Method not implemented.');
    }
    getCommonFitsHeaderParams() {
        throw new Error('Method not implemented.');
    }
    extractPhysicalValues(fits) {
        throw new Error('Method not implemented.');
    }
    getPixValues(inputPixelsList) {
        throw new Error('Method not implemented.');
    }
    computeSquaredNaxes(d, ps) {
        throw new Error('Method not implemented.');
    }
    setPxsValue(values, fitsHeaderParams) {
        throw new Error('Method not implemented.');
    }
    getImageRADecList(center, radius, pxsize) {
        throw new Error('Method not implemented.');
    }
    pix2world(i, j) {
        throw new Error('Method not implemented.');
    }
    world2pix(radeclist) {
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=TestProj.js.map