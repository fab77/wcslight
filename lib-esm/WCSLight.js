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
import { FITSParser } from 'jsfitsio';
import { MercatorProjection } from './projections/mercator/MercatorProjection.js';
import { HiPSProj } from './projections/hips/HiPSProj.js';
// import { HEALPixProjection } from './projections/HEALPixProjection.js';
import { FITS } from './model/FITS.js';
import { HiPSPropManager } from './projections/hips/HiPSPropManager.js';
import { HiPSProp } from './projections/hips/HiPSProp.js';
import { HiPSHelper } from './projections/HiPSHelper.js';
export class WCSLight {
    static cutoutToHips(center, radius, pxsize, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            // only MERCATOR supported at the moment
            const inProjection = yield WCSLight.extractProjectionType(filePath);
            if (!inProjection)
                return null;
            const tilesRaDecList = HiPSProj.getImageRADecList(center, radius, pxsize);
            if (!tilesRaDecList) {
                return null;
            }
            const inputPixelsList = inProjection.world2pix(tilesRaDecList.getRaDecList());
            const invalues = yield inProjection.getPixValues(inputPixelsList);
            const fitsHeaderParams = inProjection.getCommonFitsHeaderParams();
            if (invalues !== undefined) {
                const fitsFileList = HiPSProj.getFITSFiles(invalues, tilesRaDecList, fitsHeaderParams, pxsize);
                return fitsFileList;
            }
            return null;
        });
    }
    static extractProjectionType(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let fits = yield FITSParser.loadFITS(filePath);
            if (!fits)
                return null;
            const ctype = String((_a = fits.header.findById("CTYPE1")) === null || _a === void 0 ? void 0 : _a.value);
            if (ctype.includes("MER")) {
                return new MercatorProjection();
            }
            return null;
        });
    }
    // TODO: instead of using AbstractProjection, use a constant file with supported projection names
    static hipsCutout(center_1, radius_1, pixelAngSize_1, baseHiPSURL_1, outproj_1) {
        return __awaiter(this, arguments, void 0, function* (center, radius, pixelAngSize, baseHiPSURL, outproj, hipsOrder = null) {
            const hipsProp = yield HiPSPropManager.parsePropertyFile(baseHiPSURL);
            const hipsMaxOrder = hipsProp.getItem(HiPSProp.ORDER);
            const hipsFrame = hipsProp.getItem(HiPSProp.FRAME);
            const TILE_WIDTH = hipsProp.getItem(HiPSProp.TILE_WIDTH);
            let isGalactic = false;
            if (hipsFrame.toLowerCase() == 'galactic') {
                isGalactic = true;
            }
            if (!hipsOrder) {
                const healpix = HiPSHelper.getHelpixBypxAngSize(pixelAngSize, TILE_WIDTH);
                hipsOrder = Number(healpix.order);
            }
            if (hipsOrder > hipsMaxOrder) {
                throw new Error("requested HiPS order exceeds the maximum HiPS order ");
            }
            /*
            below how naxis are computed
            outproj.getImageRADecList -> computeSquaredNaxes -> set naxis1 and naxis2
            */
            const outRADecList = outproj.getImageRADecList(center, radius, pixelAngSize);
            if (!outRADecList)
                return null;
            // TODO check if the 2 methods  below can be merged
            const inputPixelsList = HiPSProj.world2pix(outRADecList, hipsOrder, isGalactic, TILE_WIDTH);
            const invalues = yield HiPSProj.getPixelValues(inputPixelsList, baseHiPSURL, hipsOrder, TILE_WIDTH);
            if (invalues == null) {
                throw new Error("No HiPS data found.");
            }
            // TODO GET HEADER 
            // computeSquaredNaxes to get naxis1 naxis2 in get header
            const header = outproj.prepareHeader(radius, pixelAngSize, hipsProp.getItem(HiPSProp.BITPIX), hipsProp.getItem(HiPSProp.BSCALE), hipsProp.getItem(HiPSProp.BZERO));
            // TODO set values in outproj
            const fitsdata = outproj.setPxsValue(invalues, header);
            // TODO set outproj header
            return null;
        });
    }
    static hipsFITSChangeProjection() {
        return null;
    }
    static cutout(center, radius, pxsize, inproj, outproj) {
        return __awaiter(this, void 0, void 0, function* () {
            // HIPS out
            // MER in
            const outRADecList = outproj.getImageRADecList(center, radius, pxsize);
            if (outRADecList.length == 0) {
                const res = {
                    fitsheader: [],
                    fitsdata: null,
                    inproj: inproj,
                    outproj: outproj,
                    fitsused: inproj.fitsUsed
                };
                return res;
            }
            const inputPixelsList = inproj.world2pix(outRADecList);
            try {
                const invalues = yield inproj.getPixValues(inputPixelsList);
                const fitsHeaderParams = inproj.getCommonFitsHeaderParams();
                if (invalues !== undefined) {
                    const fitsdata = outproj.setPxsValue(invalues, fitsHeaderParams);
                    const fitsheader = outproj.getFITSHeader();
                    const fits = new FITS(fitsheader, fitsdata);
                    const res = {
                        fitsheader: fits.header,
                        fitsdata: fits.data,
                        inproj: inproj,
                        outproj: outproj,
                        fitsused: inproj.fitsUsed
                    };
                    return res;
                }
                else {
                    const nanFits = outproj.generateFITSWithNaN();
                    const res = {
                        fitsheader: nanFits.header,
                        fitsdata: nanFits.data,
                        inproj: inproj,
                        outproj: outproj,
                        fitsused: inproj.fitsUsed
                    };
                    return res;
                }
            }
            catch (err) {
                console.error("[WCSLight] ERROR: " + err);
                return null;
            }
        });
    }
    /**
     *
     * @param {*} fitsheader
     * @param {*} fitsdata
     * @returns {URL}
     */
    static generateFITS(fitsheader, fitsdata) {
        const fitsParsed = {
            header: fitsheader,
            data: fitsdata
        };
        // const blobUrl = FITSParser.generateFITSForWeb(fitsheader, fitsdata);
        const blobUrl = FITSParser.generateFITSForWeb(fitsParsed);
        return blobUrl;
    }
    static changeProjection(filepath, outprojname) {
        // TODO
    }
    static getProjection(projectionName) {
        if (projectionName === "Mercator") {
            return new MercatorProjection();
        }
        else if (projectionName === "HiPS") {
            return new HiPSProjection();
            // } else if (projectionName === "HEALPix") {
            //     return new HEALPixProjection();
            // } else if (projectionName === "Gnomonic") {
            //     return new GnomonicProjection();
        }
        else {
            return null;
            // throw new ProjectionNotFound(projectionName);
        }
    }
    static getAvaillableProjections() {
        return ["Mercator", "HiPS", "HEALPix"];
    }
}
//# sourceMappingURL=WCSLight.js.map