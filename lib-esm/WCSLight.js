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
import { HiPSPropManager } from './projections/hips/HiPSPropManager.js';
import { HiPSProp } from './projections/hips/HiPSProp.js';
import { HiPSHelper } from './projections/HiPSHelper.js';
export class WCSLight {
    /**
     * This function receives a FITS and generate a cutout on HiPS FITS.
     * @param center of the cutout in degrees
     * @param radius of the cutout in degrees
     * @param pxsize of the cutout in degrees
     * @param filePath of the input FITS file
     * @returns fitsList of FITS in HiPS format
     */
    static cutoutToHips(center, radius, pxsize, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const HiPS_TILE_WIDTH = 512;
            // 0. here is missing the validation/check that the input file used to get the value, contains the center ...
            // 1. open input fits file and understand the projection and set up in inprojection details like NAXIS1-2, CDELT1-2, CRVAL1-2, minRa and minDec
            const inProjection = yield WCSLight.extractProjectionType(filePath);
            if (!inProjection)
                return null;
            // const bitpix = inProjection.getBitpix()
            // 2. from HiPS output projection, compute the list of RA,Dec and related tileno based on center, radius, pxsize, and tilewidth forced to 512
            const outTilesRaDecList = HiPSProj.getImageRADecList(center, radius, pxsize, HiPS_TILE_WIDTH);
            if (!outTilesRaDecList) {
                return null;
            }
            // 3. by using the list of RA and Dec on point 2., convert RA,Dec into i,j used in the input projection to get pixel values (try to merge the 2 calls below in one single method)
            inProjection.world2pix(outTilesRaDecList);
            // const invalues = await inProjection.getPixValues(tilesRaDecList)
            // 4. collect the details required to construct the output HiPS projection header 
            // const fitsHeaderParams = inProjection.getCommonFitsHeaderParams();
            // here pass inProjection.getFITSHeader()
            // 5. generate output HiPS FITS file(s)
            const fitsFileList = HiPSProj.getFITSFiles(outTilesRaDecList, inProjection.getFITSHeader(), pxsize, HiPS_TILE_WIDTH);
            for (let hipsFitsEntry of fitsFileList.getFITSList()) {
                const tileno = hipsFitsEntry[0];
                const hipsFits = hipsFitsEntry[1];
                const data = hipsFits.getPayload();
                const header = hipsFits.getHeader();
                const FITS_FILE_PATH = `./hips_${tileno}.fits`;
                const fitsParsed = { header: header, data: data };
                FITSParser.saveFITSLocally(fitsParsed, FITS_FILE_PATH);
            }
            return fitsFileList;
        });
    }
    // only MERCATOR supported at the moment
    static extractProjectionType(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let fits = yield FITSParser.loadFITS(filePath);
            if (!fits)
                return null;
            const ctype = String((_a = fits.header.findById("CTYPE1")) === null || _a === void 0 ? void 0 : _a.value);
            if (ctype.includes("MER")) {
                let projection = new MercatorProjection();
                yield projection.initFromFile(filePath);
                return projection;
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
            const result = yield HiPSProj.world2pix(outRADecList, hipsOrder, isGalactic, TILE_WIDTH, baseHiPSURL);
            console.log(result);
            // const invalues = await HiPSProj.getPixelValues(inputPixelsList, baseHiPSURL, hipsOrder, TILE_WIDTH);
            // if (invalues == null) {
            //     throw new Error("No HiPS data found.")
            // }
            // // TODO GET HEADER 
            // computeSquaredNaxes to get naxis1 naxis2 in get header
            // const header = outproj.prepareHeader(
            //     radius, pixelAngSize, 
            //     hipsProp.getItem(HiPSProp.BITPIX), 
            //     hipsProp.getItem(HiPSProp.SCALE), 
            //     hipsProp.getItem(HiPSProp.TILE_WIDTH), 
            //     hipsProp.getItem(HiPSProp.ZERO))
            // TODO set values in outproj
            // const fitsdata = outproj.setPxsValue(outRADecList, header);
            // const header = outproj.computeHeader(pixelAngSize, 
            //     hipsProp.getItem(HiPSProp.BITPIX), 
            //     hipsProp.getItem(HiPSProp.SCALE
            //     ))
            // TODO set outproj header
            return null;
        });
    }
    static hipsFITSChangeProjection() {
        return null;
    }
    // static async cutout(center: Point, radius: number,
    //     pxsize: number, inproj: AbstractProjection, outproj: AbstractProjection): Promise<CutoutResult> {
    //     // HIPS out
    //     // MER in
    //     const outRADecList: Array<Array<number>> = outproj.getImageRADecList(center, radius, pxsize);
    //     if (outRADecList.length == 0) {
    //         const res: CutoutResult = {
    //             fitsheader: [],
    //             fitsdata: null,
    //             inproj: inproj,
    //             outproj: outproj,
    //             fitsused: inproj.fitsUsed
    //         };
    //         return res;
    //     }
    //     const inputPixelsList = inproj.world2pix(outRADecList);
    //     try {
    //         const invalues = await inproj.getPixValues(inputPixelsList);
    //         const fitsHeaderParams = inproj.getCommonFitsHeaderParams();
    //         if (invalues !== undefined) {
    //             const fitsdata = outproj.setPxsValue(invalues, fitsHeaderParams);
    //             const fitsheader = outproj.getFITSHeader();
    //             const fits = new FITS(fitsheader, fitsdata)
    //             const res: CutoutResult = {
    //                 fitsheader: fits.header,
    //                 fitsdata: fits.data,
    //                 inproj: inproj,
    //                 outproj: outproj,
    //                 fitsused: inproj.fitsUsed
    //             };
    //             return res;
    //         } else {
    //             const nanFits = outproj.generateFITSWithNaN()
    //             const res: CutoutResult = {
    //                 fitsheader: nanFits.header,
    //                 fitsdata: nanFits.data,
    //                 inproj: inproj,
    //                 outproj: outproj,
    //                 fitsused: inproj.fitsUsed
    //             };
    //             return res;
    //         }
    //     } catch (err) {
    //         console.error("[WCSLight] ERROR: " + err);
    //         return null;
    //     }
    // }
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
    // static changeProjection(filepath, outprojname) {
    //     // TODO
    // }
    static getProjection(projectionName) {
        if (projectionName === "Mercator") {
            return new MercatorProjection();
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
// const center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 170.015, 18.35);
// WCSLight.cutoutToHips(center, 0.06, 0.0005, "/Users/fgiordano/Desktop/REORG/PhD/code/github/wcslight/test/output/UC3/3_0/Mercator46.fits").then(res => {
//     console.log(res)
// })
//# sourceMappingURL=WCSLight.js.map