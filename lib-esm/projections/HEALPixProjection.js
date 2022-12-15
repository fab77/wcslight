import { AbstractProjection } from "./AbstractProjection.js";
export class HEALPixProjection extends AbstractProjection {
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
//# sourceMappingURL=HEALPixProjection.js.map