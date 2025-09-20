/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FITSParser, FITSHeaderManager, FITSHeaderItem, ParseUtils } from 'jsfitsio';
import { AbstractProjection } from '../AbstractProjection.js';
import { Point } from '../../model/Point.js';
import { CoordsType } from '../../model/CoordsType.js';
import { NumberType } from '../../model/NumberType.js';
import { TilesRaDecList2 } from '../hips/TilesRaDecList2.js';
import { ImagePixel } from '../hips/ImagePixel.js';
import { FITS } from '../../model/FITS.js';
// import { HiPSProp } from '../hips/HiPSProp.js';
export class MercatorProjection extends AbstractProjection {
    constructor() {
        super();
        this.CTYPE1 = "'RA---CAR'";
        this.CTYPE2 = "'DEC--CAR'";
        this._wcsname = "MER"; // TODO check WCS standard and create ENUM
        this.pxvalues = new Array();
        this.fitsheader = new FITSHeaderManager();
    }
    initFromFile(infile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const fits = yield FITSParser.loadFITS(infile);
            if (!fits) {
                console.error("FITS is null");
                throw new Error("FITS is null");
            }
            this.pxvalues = fits.data;
            this.fitsheader = fits.header;
            this.naxis1 = Number((_a = fits.header.findById("NAXIS1")) === null || _a === void 0 ? void 0 : _a.value);
            this.naxis2 = Number((_b = fits.header.findById("NAXIS2")) === null || _b === void 0 ? void 0 : _b.value);
            this.bitpix = (_c = fits.header.findById("BITPIX")) === null || _c === void 0 ? void 0 : _c.value;
            this.craDeg = (_d = fits.header.findById("CRVAL1")) === null || _d === void 0 ? void 0 : _d.value;
            this.cdecDeg = (_e = fits.header.findById("CRVAL2")) === null || _e === void 0 ? void 0 : _e.value;
            const pxsize1 = (_f = this.fitsheader.findById("CDELT1")) === null || _f === void 0 ? void 0 : _f.value;
            const pxsize2 = (_g = this.fitsheader.findById("CDELT2")) === null || _g === void 0 ? void 0 : _g.value;
            if (pxsize1 !== pxsize2 || pxsize1 === undefined || pxsize2 === undefined) {
                throw new Error("pxsize1 is not equal to pxsize2");
            }
            this.pxsize = pxsize1;
            this.minra = this.craDeg - this.pxsize * this.naxis1 / 2;
            if (this.minra < 0) {
                this.minra += 360;
            }
            // this._mindec = this._cdecDeg - this._pxsize2 * this._naxis2 / 2;
            this.mindec = this.cdecDeg - this.pxsize * this.naxis2 / 2;
            return fits;
        });
    }
    getBytePerValue() {
        return Math.abs(this.bitpix / 8);
    }
    extractPhysicalValues(fits) {
        var _a, _b, _c, _d, _e;
        const bzero = Number((_a = fits.header.findById("BZERO")) === null || _a === void 0 ? void 0 : _a.value);
        const bscale = Number((_b = fits.header.findById("BSCALE")) === null || _b === void 0 ? void 0 : _b.value);
        const naxis1 = Number((_c = fits.header.findById("NAXIS1")) === null || _c === void 0 ? void 0 : _c.value);
        const naxis2 = Number((_d = fits.header.findById("NAXIS2")) === null || _d === void 0 ? void 0 : _d.value);
        const bitpix = Number((_e = fits.header.findById("BITPIX")) === null || _e === void 0 ? void 0 : _e.value);
        const bytesXelem = Math.abs(bitpix / 8);
        let physicalvalues = new Array(naxis2);
        for (let n2 = 0; n2 < naxis2; n2++) {
            physicalvalues[n2] = new Array(naxis1);
            for (let n1 = 0; n1 < naxis1; n1++) {
                const pixval = ParseUtils.extractPixelValue(0, fits.data[n2].slice(n1 * bytesXelem, (n1 + 1) * bytesXelem), bitpix);
                if (pixval) {
                    let physicalVal = bzero + bscale * pixval;
                    physicalvalues[n2][n1] = physicalVal;
                }
            }
        }
        return physicalvalues;
    }
    // computeHeader(pxsize: number, bitpix: number, scale: number = 1, zero: number = 0, blank: number = 0): FITSHeaderManager{
    //     const header = new FITSHeaderManager()
    //     header.insert(new FITSHeaderItem("SIMPLE", "'T'", ""));
    //     header.insert(new FITSHeaderItem("BITPIX", bitpix, ""));
    //     header.insert(new FITSHeaderItem("NAXIS", 2, ""));
    //     header.insert(new FITSHeaderItem("NAXIS1", this.naxis1, ""));
    //     header.insert(new FITSHeaderItem("NAXIS2", this.naxis2, ""));
    //     header.insert(new FITSHeaderItem("BLANK", blank, ""));
    //     header.insert(new FITSHeaderItem("BSCALE", scale, ""));
    //     header.insert(new FITSHeaderItem("BZERO", zero, ""));
    //     header.insert(new FITSHeaderItem("CTYPE1", this.CTYPE1, ""));
    //     header.insert(new FITSHeaderItem("CTYPE2", this.CTYPE2, ""));
    //     header.insert(new FITSHeaderItem("CDELT1", pxsize, "")); // ??? Pixel spacing along axis 1 ???
    //     header.insert(new FITSHeaderItem("CDELT2", pxsize, "")); // ??? Pixel spacing along axis 2 ???
    //     header.insert(new FITSHeaderItem("CRPIX1", this.naxis1 / 2, "")); // central/reference pixel i along naxis1
    //     header.insert(new FITSHeaderItem("CRPIX2", this.naxis2 / 2, "")); // central/reference pixel j along naxis2
    //     header.insert(new FITSHeaderItem("CRVAL1", this.craDeg, "")); // central/reference pixel RA
    //     header.insert(new FITSHeaderItem("CRVAL2", this.cdecDeg, "")); // central/reference pixel Dec
    //     let min = zero + scale * this._minphysicalval;
    //     let max = zero + scale * this._maxphysicalval;
    //     header.insert(new FITSHeaderItem("DATAMIN", min, "")); // min data value
    //     header.insert(new FITSHeaderItem("DATAMAX", max, "")); // max data value
    //     header.insert(new FITSHeaderItem("ORIGIN", "'WCSLight v.0.x'", ""));
    //     header.insert(new FITSHeaderItem("COMMENT", "", "'WCSLight v0.x developed by F.Giordano and Y.Ascasibar'"));
    //     header.insert(new FITSHeaderItem("END", "", ""));
    //     return this.fitsheader;
    // }
    // TODO CHECK: there are 4 header related methods!!! prepareHeader, prepareFITSHeader, getCommonFitsHeaderParams and getFITSHeader
    // static prepareHeader(radius: number, pixelAngSize: number,
    //     bitpix: number, bscale?: number, bzero?: number
    // ) {
    //     if (!bscale) bscale = 1
    //     if (!bzero) bzero = 0
    //     const naxis1 = Math.ceil(2 * radius / pixelAngSize);
    //     const naxis2 = naxis1
    //     if (!bitpix) {
    //         throw new Error("Bitpix not defined")
    //     }
    // }
    prepareHeader(pixelAngSize, BITPIX, TILE_WIDTH, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue) {
        const fitsheader = new FITSHeaderManager();
        fitsheader.insert(new FITSHeaderItem("SIMPLE", "T", ""));
        fitsheader.insert(new FITSHeaderItem("NAXIS1", TILE_WIDTH, ""));
        fitsheader.insert(new FITSHeaderItem("NAXIS2", TILE_WIDTH, ""));
        fitsheader.insert(new FITSHeaderItem("NAXIS", 2, ""));
        fitsheader.insert(new FITSHeaderItem("BITPIX", BITPIX, ""));
        fitsheader.insert(new FITSHeaderItem("BLANK", BLANK, ""));
        fitsheader.insert(new FITSHeaderItem("BSCALE", BSCALE, ""));
        fitsheader.insert(new FITSHeaderItem("BZERO", BZERO, ""));
        fitsheader.insert(new FITSHeaderItem("CTYPE1", this.CTYPE1, ""));
        fitsheader.insert(new FITSHeaderItem("CTYPE2", this.CTYPE2, ""));
        fitsheader.insert(new FITSHeaderItem("CDELT1", pixelAngSize, "")); // ??? Pixel spacing along axis 1 ???
        fitsheader.insert(new FITSHeaderItem("CDELT2", pixelAngSize, "")); // ??? Pixel spacing along axis 2 ???
        fitsheader.insert(new FITSHeaderItem("CRPIX1", TILE_WIDTH / 2, "")); // central/reference pixel i along naxis1
        fitsheader.insert(new FITSHeaderItem("CRPIX2", TILE_WIDTH / 2, "")); // central/reference pixel j along naxis2
        fitsheader.insert(new FITSHeaderItem("CRVAL1", cRA, "")); // central/reference pixel RA
        fitsheader.insert(new FITSHeaderItem("CRVAL2", cDec, "")); // central/reference pixel Dec
        const min = BZERO + BSCALE * minValue;
        const max = BZERO + BSCALE * maxValue;
        fitsheader.insert(new FITSHeaderItem("DATAMIN", min, "")); // min data value
        fitsheader.insert(new FITSHeaderItem("DATAMAX", max, "")); // max data value
        fitsheader.insert(new FITSHeaderItem("ORIGIN", "'WCSLight v.0.x'", ""));
        fitsheader.insert(new FITSHeaderItem("COMMENT", "", "'WCSLight v0.x developed by F.Giordano and Y.Ascasibar'"));
        fitsheader.insert(new FITSHeaderItem("END", "", ""));
        return fitsheader;
    }
    // TODO CHECK: there are 4 header related methods!!! prepareHeader, prepareFITSHeader, getCommonFitsHeaderParams and getFITSHeader
    // prepareFITSHeader(fitsHeaderParams: FITSHeaderManager): FITSHeaderManager {
    //     this.fitsheader = new FITSHeaderManager();
    //     this.fitsheader.insert(new FITSHeaderItem("NAXIS1", this.naxis1, ""));
    //     this.fitsheader.insert(new FITSHeaderItem("NAXIS2", this.naxis2, ""));
    //     this.fitsheader.insert(new FITSHeaderItem("NAXIS", 2, ""));
    //     const bitpix = Number(fitsHeaderParams.findById("BITPIX")?.value)
    //     this.fitsheader.insert(new FITSHeaderItem("BITPIX", bitpix, ""));
    //     const simple = Number(fitsHeaderParams.findById("SIMPLE")?.value)
    //     this.fitsheader.insert(new FITSHeaderItem("SIMPLE", simple, ""));
    //     const blank = Number(fitsHeaderParams.findById("BLANK")?.value)
    //     if (blank) {
    //         this.fitsheader.insert(new FITSHeaderItem("BLANK", blank, ""));
    //     }
    //     let bscale = Number(fitsHeaderParams.findById("BSCALE")?.value)
    //     if (!bscale) {
    //         bscale = 1.0;
    //     }
    //     this.fitsheader.insert(new FITSHeaderItem("BSCALE", bscale, ""));
    //     let bzero = Number(fitsHeaderParams.findById("BZERO")?.value)
    //     if (!bzero) {
    //         bzero = 0.0;
    //     }
    //     this.fitsheader.insert(new FITSHeaderItem("BZERO", bzero, ""));
    //     this.fitsheader.insert(new FITSHeaderItem("CTYPE1", this.CTYPE1, ""));
    //     this.fitsheader.insert(new FITSHeaderItem("CTYPE2", this.CTYPE2, ""));
    //     this.fitsheader.insert(new FITSHeaderItem("CDELT1", this.pxsize, "")); // ??? Pixel spacing along axis 1 ???
    //     this.fitsheader.insert(new FITSHeaderItem("CDELT2", this.pxsize, "")); // ??? Pixel spacing along axis 2 ???
    //     this.fitsheader.insert(new FITSHeaderItem("CRPIX1", this.naxis1 / 2, "")); // central/reference pixel i along naxis1
    //     this.fitsheader.insert(new FITSHeaderItem("CRPIX2", this.naxis2 / 2, "")); // central/reference pixel j along naxis2
    //     this.fitsheader.insert(new FITSHeaderItem("CRVAL1", this.craDeg, "")); // central/reference pixel RA
    //     this.fitsheader.insert(new FITSHeaderItem("CRVAL2", this.cdecDeg, "")); // central/reference pixel Dec
    //     let min = bzero + bscale * this._minphysicalval;
    //     let max = bzero + bscale * this._maxphysicalval;
    //     this.fitsheader.insert(new FITSHeaderItem("DATAMIN", min, "")); // min data value
    //     this.fitsheader.insert(new FITSHeaderItem("DATAMAX", max, "")); // max data value
    //     this.fitsheader.insert(new FITSHeaderItem("ORIGIN", "'WCSLight v.0.x'", ""));
    //     this.fitsheader.insert(new FITSHeaderItem("COMMENT", "", "'WCSLight v0.x developed by F.Giordano and Y.Ascasibar'"));
    //     this.fitsheader.insert(new FITSHeaderItem("END", "", ""));
    //     return this.fitsheader;
    // }
    // TODO CHECK: there are 4 header related methods!!! prepareHeader, prepareFITSHeader, getCommonFitsHeaderParams and getFITSHeader
    getFITSHeader() {
        return this.fitsheader;
    }
    // TODO CHECK: there are 4 header related methods!!! prepareHeader, prepareFITSHeader, getCommonFitsHeaderParams and getFITSHeader
    getCommonFitsHeaderParams() {
        let header = new FITSHeaderManager();
        for (const item of this.fitsheader.getItems()) {
            const key = item.key;
            if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER",].includes(key)) {
                const value = item.value;
                header.insert(new FITSHeaderItem(key, value, ""));
            }
        }
        return header;
    }
    // computeSquaredNaxes(d: number, ps: number): void {
    //     this._naxis1 = Math.ceil(d / ps);
    //     this._naxis2 = this._naxis1;
    //     this._pxsize = ps;
    // }
    computeNaxisWidth(radius, pxsize) {
        return Math.ceil(2 * radius / pxsize);
    }
    getImageRADecList(center, radius, pxsize, naxisWidth) {
        const naxis1 = naxisWidth;
        const naxis2 = naxis1;
        let minra = center.getAstro().raDeg - radius;
        if (minra < 0) {
            minra += 360;
        }
        const mindec = center.getAstro().decDeg - radius;
        const tilesRaDecList = new TilesRaDecList2();
        // let radeclist: Array<[number, number]> = new Array<[number, number]>();
        // let centralRa, centralDec
        for (let d = 0; d < naxis2; d++) {
            for (let r = 0; r < naxis1; r++) {
                tilesRaDecList.addImagePixel(new ImagePixel(minra + (r * pxsize), mindec + (d * pxsize), undefined));
                // radeclist.push([minra + (r * pxsize), mindec + (d * pxsize)]);
            }
        }
        const centralImgpx = tilesRaDecList.getImagePixelList().length / 2 - 1;
        // let cidx = (naxis2 / 2) * naxis1 + naxis1 / 2;
        // if (naxis1 % 2 != 0) {
        //     cidx = Math.floor(radeclist.length / 2);
        // }
        // this._craDeg = radeclist[cidx][0];
        // this._cdecDeg = radeclist[cidx][1];
        // return radeclist
        return tilesRaDecList;
    }
    /** TODO !!! check and handle RA passing through 360-0 */
    pix2world(i, j) {
        let ra;
        let dec;
        // ra = i * this._stepra + this._minra;
        // dec = j * this._stepdec + this._mindec;
        ra = i * this.pxsize + this.minra;
        dec = j * this.pxsize + this.mindec;
        let p = new Point(CoordsType.ASTRO, NumberType.DEGREES, ra, dec);
        return p;
        // return [ra, dec];
    }
    setPixelValues(raDecList, header) {
        var _a, _b, _c, _d;
        const BITPIX = (_a = header.findById("BITPIX")) === null || _a === void 0 ? void 0 : _a.value;
        if (!Number.isFinite(BITPIX)) {
            throw new Error("BITPIX not found or invalid in header");
        }
        const bytesPerElem = Math.abs(BITPIX) / 8;
        const width = (_b = header.findById("NAXIS1")) === null || _b === void 0 ? void 0 : _b.value;
        const height = (_d = (_c = header.findById("NAXIS2")) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : width; // fallback if square
        if (!Number.isFinite(width) || width <= 0)
            throw new Error("NAXIS1 not found or invalid");
        if (!Number.isFinite(height) || height <= 0)
            throw new Error("NAXIS2 not found or invalid");
        const pixels = raDecList.getImagePixelList();
        if (pixels.length !== width * height) {
            throw new Error(`Pixel count mismatch: got ${pixels.length}, expected ${width * height}`);
        }
        // Map<rowIndex, Uint8Array[]>, each row has length = width
        const pxvalues = new Map();
        for (let r = 0; r < height; r++) {
            pxvalues.set(r, new Array(width));
        }
        // Fill in row-major order: for each linear index, compute (row, col)
        for (let idx = 0; idx < pixels.length; idx++) {
            const row = Math.floor(idx / width);
            const col = idx % width;
            const rowArr = pxvalues.get(row);
            let u8 = pixels[idx].getUint8Value();
            if (u8 == null) {
                // Your pipeline’s ImagePixel.setValue() should have set this already.
                // Throwing is safer than inventing packing (FITS expects specific endian/precision).
                throw new Error(`Pixel (${row},${col}) missing Uint8Array for BITPIX=${BITPIX}`);
            }
            if (u8.byteLength !== bytesPerElem) {
                throw new Error(`Pixel (${row},${col}) byteLength=${u8.byteLength} != expected ${bytesPerElem} (BITPIX=${BITPIX})`);
            }
            rowArr[col] = u8;
            // no need to pxvalues.set(row, rowArr); reference already updated
        }
        return new FITS([header], pxvalues);
    }
    generateFITSFile(pixelAngSize, BITPIX, TILE_WIDTH, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue, raDecWithValues) {
        const header = this.prepareHeader(pixelAngSize, BITPIX, TILE_WIDTH, BLANK, BZERO, BSCALE, cRA, cDec, minValue, maxValue);
        const fits = this.setPixelValues(raDecWithValues, header);
        return fits;
    }
    world2pix(raDecList) {
        var _a;
        const bytesXvalue = this.getBytePerValue();
        // TODO if I have the this.fitsheader available here, check if I can retrieve this.bitpix, this.pxsize, ... with this.fitsheader
        // and remove the attributes at object level (with this)
        const blank = Number((_a = this.fitsheader.findById("BLANK")) === null || _a === void 0 ? void 0 : _a.value);
        const blankBytes = ParseUtils.convertBlankToBytes(blank, bytesXvalue);
        for (let imgPx of raDecList.getImagePixelList()) {
            // console.log("raDeclist.getImagePixelList().indexOf(imgPx) " + raDeclist.getImagePixelList().indexOf(imgPx))
            const ra = imgPx.getRADeg();
            const dec = imgPx.getDecDeg();
            const i = Math.floor((ra - this.minra) / this.pxsize);
            const j = Math.floor((dec - this.mindec) / this.pxsize);
            if (j < 0 || j >= this.naxis2 || i < 0 || i >= this.naxis1) {
                imgPx.setValue(blankBytes, this.bitpix);
            }
            else {
                const currentValue = this.pxvalues[j].slice(i * bytesXvalue, (i + 1) * bytesXvalue);
                imgPx.setValue(currentValue, this.bitpix);
            }
            raDecList.setMinMaxValue(imgPx.getValue());
        }
        return raDecList;
    }
}
//# sourceMappingURL=MercatorProjection.js.map