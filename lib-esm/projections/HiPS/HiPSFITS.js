var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FITSHeaderItem, FITSHeaderManager, FITSParser, ParseUtils } from "jsfitsio";
import { HiPSIntermediateProj } from "./HiPSIntermediateProj.js";
import { Pointing } from "healpixjs";
import { astroToSpherical, fillAstro, radToDeg } from "../../model/Utils.js";
import { NumberType } from "../../model/NumberType.js";
import { HiPSHelper } from "../HiPSHelper.js";
import { HiPSProp } from "./HiPSProp.js";
export class HiPSFITS {
    constructor(fitsParsed, tileno, hipsProp) {
        this.payload = [];
        this.min = NaN;
        this.max = NaN;
        if (fitsParsed) {
            this.initFromFITSParsed(fitsParsed);
        }
        else if (!tileno || !hipsProp) {
            console.error("tileno or hipsProp are not defined");
            throw new Error("tileno or hipsProp are not defined");
        }
        else {
            this.order = hipsProp.getItem(HiPSProp.ORDER);
            const naxis1 = hipsProp.getItem(HiPSProp.TILE_WIDTH);
            const naxis2 = hipsProp.getItem(HiPSProp.TILE_WIDTH);
            this.tileno = tileno;
            if (naxis1 != naxis2) {
                console.error("NAXIS1 and NAXIS2 do not match.");
                throw new Error("NAXIS1 and NAXIS2 do not match.");
            }
            this.tileno = naxis1;
            this.healpix = HiPSHelper.getHelpixByOrder(this.order);
            this.intermediateXYGrid = HiPSIntermediateProj.setupByTile(this.tileno, this.healpix);
        }
    }
    initFromUint8Array(raDecList, originalValues, fitsHeaderParams) {
        this.setPayload(raDecList, originalValues, fitsHeaderParams);
        this.setHeader(fitsHeaderParams);
    }
    initFromFITSParsed(fitsParsed) {
        var _a, _b, _c, _d;
        this.payload = fitsParsed.data;
        this.order = Number((_a = fitsParsed.header.findById(HiPSProp.ORDER)) === null || _a === void 0 ? void 0 : _a.value);
        const naxis1 = Number((_b = fitsParsed.header.findById(FITSHeaderManager.NAXIS1)) === null || _b === void 0 ? void 0 : _b.value);
        const naxis2 = Number((_c = fitsParsed.header.findById(FITSHeaderManager.NAXIS2)) === null || _c === void 0 ? void 0 : _c.value);
        this.tileno = Number((_d = fitsParsed.header.findById(HiPSFITS.NPIX)) === null || _d === void 0 ? void 0 : _d.value);
        if (isNaN(this.order) || isNaN(naxis1) || isNaN(naxis2) || isNaN(this.tileno)) {
            console.warn("ORDER, NAXIS1 or NAXIS2 not defined");
            throw new Error("ORDER, NAXIS1 or NAXIS2 not defined");
        }
        if (naxis1 != naxis2) {
            console.error("NAXIS1 and NAXIS2 do not match.");
            throw new Error("NAXIS1 and NAXIS2 do not match.");
        }
        this.tileWidth = naxis1;
        this.computeMinMax(fitsParsed);
        this.setHeader(fitsParsed.header);
    }
    getTileno() {
        return this.tileno;
    }
    computeMinMax(fitsParsed) {
        var _a, _b, _c;
        const bitpix = Number((_a = fitsParsed.header.findById(FITSHeaderManager.BITPIX)) === null || _a === void 0 ? void 0 : _a.value);
        const bzero = Number((_b = fitsParsed.header.findById(FITSHeaderManager.BZERO)) === null || _b === void 0 ? void 0 : _b.value);
        const bscale = Number((_c = fitsParsed.header.findById(FITSHeaderManager.BSCALE)) === null || _c === void 0 ? void 0 : _c.value);
        const bytesXelem = Math.abs(bitpix / 8);
        for (let ridx = 0; ridx < fitsParsed.data.length; ridx++) {
            const row = fitsParsed.data[ridx];
            for (let cidx = 0; cidx < row.length; cidx++) {
                const valpixb = ParseUtils.extractPixelValue(0, this.payload[ridx].slice(cidx * bytesXelem, cidx * bytesXelem + bytesXelem), bitpix);
                if (valpixb == null) {
                    continue;
                }
                const valphysical = bzero + bscale * valpixb;
                if (valphysical < this.min || isNaN(this.min)) {
                    this.min = valphysical;
                }
                else if (valphysical > this.max || isNaN(this.max)) {
                    this.max = valphysical;
                }
            }
        }
    }
    static downloadFITSFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const fits = yield FITSParser.loadFITS(path);
            if (fits == null) {
                console.warn(`fits ${path} doesn't exist`);
                return null;
            }
            return fits;
        });
    }
    getFITS() {
        return { header: this.header, data: this.payload };
    }
    setPayload(raDecList, originalValues, fitsHeaderParams) {
        var _a, _b, _c;
        this.payload = new Array(this.tileWidth);
        const bitpix = Number((_a = fitsHeaderParams.findById(FITSHeaderManager.BITPIX)) === null || _a === void 0 ? void 0 : _a.value);
        const bzero = Number((_b = fitsHeaderParams.findById(FITSHeaderManager.BZERO)) === null || _b === void 0 ? void 0 : _b.value);
        const bscale = Number((_c = fitsHeaderParams.findById(FITSHeaderManager.BSCALE)) === null || _c === void 0 ? void 0 : _c.value);
        const bytesXelem = Math.abs(bitpix / 8);
        if (!bytesXelem) {
            console.error("BITPIX not defined");
            throw new Error("BITPIX not defined");
        }
        for (let row = 0; row < this.tileWidth; row++) {
            this.payload[row] = new Uint8Array(this.tileWidth * bytesXelem);
        }
        for (let rdidx = 0; rdidx < raDecList.length; rdidx++) {
            const [ra, dec] = raDecList[rdidx];
            const ac = fillAstro(ra, dec, NumberType.DEGREES);
            if (ac == null) {
                console.error(`Error converting ${ra}, ${dec} into AstroCoords object`);
                continue;
            }
            const sc = astroToSpherical(ac);
            const ptg = new Pointing(null, false, sc.thetaRad, sc.phiRad);
            const pixtileno = this.healpix.ang2pix(ptg);
            if (pixtileno != this.tileno) {
                continue;
            }
            const xy = HiPSIntermediateProj.world2intermediate(ac);
            let ij = HiPSIntermediateProj.intermediate2pix(xy[0], xy[1], this.intermediateXYGrid, this.tileWidth);
            const col = ij[0];
            const row = ij[1];
            for (let b = 0; b < bytesXelem; b++) {
                const byte = originalValues[rdidx * bytesXelem + b];
                this.payload[row][col * bytesXelem + b] = byte;
                // TODO check what's nodata!
                // if (nodata.get("" + pixtileno + "")) {
                // 	if (byte != 0) {
                // 		nodata.set("" + pixtileno + "", false);
                // 	}
                // }
                const valpixb = ParseUtils.extractPixelValue(0, this.payload[row].slice(col * bytesXelem, col * bytesXelem + bytesXelem), bitpix);
                if (valpixb == null) {
                    continue;
                }
                const valphysical = bzero + bscale * valpixb;
                if (valphysical < this.min || isNaN(this.min)) {
                    this.min = valphysical;
                }
                else if (valphysical > this.max || isNaN(this.max)) {
                    this.max = valphysical;
                }
            }
        }
    }
    addMandatoryItemToHeader(key, fitsHeaderParams) {
        var _a;
        const value = (_a = fitsHeaderParams.findById(key)) === null || _a === void 0 ? void 0 : _a.value;
        if (value === undefined || value == null) {
            console.error(`${key} not defined`);
            throw new Error(key + " is not defined");
        }
        const item = new FITSHeaderItem(key, value, "");
        this.header.insert(item);
    }
    addItemToHeader(key, fitsHeaderParams) {
        var _a;
        const value = (_a = fitsHeaderParams.findById(key)) === null || _a === void 0 ? void 0 : _a.value;
        if (value !== undefined || value != null) {
            const item = new FITSHeaderItem(key, value, "");
            this.header.insert(item);
        }
    }
    setHeader(fitsHeaderParams) {
        this.header = new FITSHeaderManager();
        this.addMandatoryItemToHeader(FITSHeaderManager.SIMPLE, fitsHeaderParams);
        this.addMandatoryItemToHeader(FITSHeaderManager.BITPIX, fitsHeaderParams);
        this.addItemToHeader(FITSHeaderManager.BLANK, fitsHeaderParams);
        this.addItemToHeader(FITSHeaderManager.BSCALE, fitsHeaderParams);
        this.addItemToHeader(FITSHeaderManager.BZERO, fitsHeaderParams);
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.NAXIS, Number(2), ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.NAXIS1, Number(this.tileWidth), ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.NAXIS2, Number(this.tileWidth), ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CTYPE1, HiPSFITS.CTYPE1, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CTYPE2, HiPSFITS.CTYPE2, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.DATAMIN, this.min, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.DATAMAX, this.min, ""));
        this.header.insert(new FITSHeaderItem(HiPSProp.ORDER, Number(this.order), ""));
        this.header.insert(new FITSHeaderItem(HiPSFITS.NPIX, Number(this.tileno), ""));
        const crpix = this.tileno / 2;
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CRPIX1, crpix, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CRPIX2, crpix, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.ORIGIN, "WCSLight v.0.x", ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.COMMENT, "", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar"));
        let vec3 = this.healpix.pix2vec(this.tileno);
        let ptg = new Pointing(vec3);
        let crval1 = radToDeg(ptg.phi);
        let crval2 = 90 - radToDeg(ptg.theta);
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CRVAL1, crval1, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CRVAL2, crval2, ""));
        this.header.insert(new FITSHeaderItem("END", "", ""));
    }
}
HiPSFITS.CTYPE1 = "RA---HPX";
HiPSFITS.CTYPE2 = "DEC--HPX";
HiPSFITS.NPIX = "NPIX";
//# sourceMappingURL=HiPSFITS.js.map