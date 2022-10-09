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

export class WCSLight {

    /** @constructs WCSLight */
    constructor() { }

    static async cutout(center: Point, radius: number,
        pxsize: number, inproj: AbstractProjection, outproj: AbstractProjection): Promise<CutoutResult> {

        const outRADecList: Array<Array<number>> = outproj.getImageRADecList(center, radius, pxsize);
        if (outRADecList.length == 0) {
            const res: CutoutResult = {
                fitsheader: null,
                fitsdata: null,
                inproj: inproj,
                outproj: outproj
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
                // let canvas2d = outproj.getCanvas2d();
                const res: CutoutResult = {
                    fitsheader: fitsheader,
                    fitsdata: fitsdata,
                    inproj: inproj,
                    outproj: outproj
                };
                return res;
            } else {
                const res: CutoutResult = {
                    fitsheader: null,
                    fitsdata: null,
                    inproj: inproj,
                    outproj: outproj
                };
                return res;
            }

        } catch (err) {
            console.error("[WCSLight] ERROR: " + err);
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

