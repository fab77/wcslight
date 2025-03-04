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
import { MercatorProjection } from './projections/MercatorProjection.js';
import { HiPSProjection } from './projections/HiPSProjection.js';
import { HEALPixProjection } from './projections/HEALPixProjection.js';
import { GnomonicProjection } from './projections/GnomonicProjection.js';
import { FITS } from './model/FITS.js';
export class WCSLight {
    static cutout(center, radius, pxsize, inproj, outproj) {
        return __awaiter(this, void 0, void 0, function* () {
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
        }
        else if (projectionName === "HEALPix") {
            return new HEALPixProjection();
        }
        else if (projectionName === "Gnomonic") {
            return new GnomonicProjection();
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