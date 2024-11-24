/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

import { FITSParser } from 'jsfitsio';
import { MercatorProjection } from './projections/MercatorProjection.js';
import { HiPSProjection } from './projections/HiPSProjection.js';
import { Point } from './model/Point.js';
import { AbstractProjection } from './projections/AbstractProjection.js';
import { CutoutResult } from './model/CutoutResult.js';

import { HEALPixProjection } from './projections/HEALPixProjection.js';
import { GnomonicProjection } from './projections/GnomonicProjection.js';
import { FITS } from './model/FITS.js';

export class WCSLight {

    static async cutout(center: Point, radius: number,
        pxsize: number, inproj: AbstractProjection, outproj: AbstractProjection): Promise<CutoutResult> {

        const outRADecList: Array<Array<number>> = outproj.getImageRADecList(center, radius, pxsize);
        if (outRADecList.length == 0) {
            const res: CutoutResult = {
                fitsheader: null,
                fitsdata: null,
                inproj: inproj,
                outproj: outproj,
                fitsused: inproj.fitsUsed
            };
            return res;
        }
        const inputPixelsList = inproj.world2pix(outRADecList);
        try {

            const invalues = await inproj.getPixValues(inputPixelsList);
            const fitsHeaderParams = inproj.getCommonFitsHeaderParams();
            if (invalues !== undefined) {
                const fitsdata = outproj.setPxsValue(invalues, fitsHeaderParams);
                const fitsheader = outproj.getFITSHeader();
                const fits = new FITS(fitsheader, fitsdata)
                
                const res: CutoutResult = {
                    fitsheader: fits.header,
                    fitsdata: fits.data,
                    inproj: inproj,
                    outproj: outproj,
                    fitsused: inproj.fitsUsed
                };
                return res;
            } else {
                const nanFits = outproj.generateFITSWithNaN()
                const res: CutoutResult = {
                    fitsheader: nanFits.header,
                    fitsdata: nanFits.data,
                    inproj: inproj,
                    outproj: outproj,
                    fitsused: inproj.fitsUsed
                };
                return res;
            }

        } catch (err) {
            console.error("[WCSLight] ERROR: " + err);
            return null;
        }

    }

    /**
     * 
     * @param {*} fitsheader 
     * @param {*} fitsdata 
     * @returns {URL}
     */
    static generateFITS(fitsheader: any, fitsdata: any): string {
        const blobUrl = FITSParser.generateFITS(fitsheader, fitsdata);
        return blobUrl;
    }




    static changeProjection(filepath, outprojname) {
        // TODO
    }


    static getProjection(projectionName: string) {
        if (projectionName === "Mercator") {
            return new MercatorProjection();
        } else if (projectionName === "HiPS") {
            return new HiPSProjection();
        } else if (projectionName === "HEALPix") {
            return new HEALPixProjection();
        } else if (projectionName === "Gnomonic") {
            return new GnomonicProjection();
        } else {
            return null;
            // throw new ProjectionNotFound(projectionName);
        }
    }

    static getAvaillableProjections() {
        return ["Mercator", "HiPS", "HEALPix"];
    }

}

