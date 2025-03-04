/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

import { FITSParsed, FITSParser } from 'jsfitsio';
import { MercatorProjection } from './projections/Mercator/MercatorProjection.js';
import { HiPSProj } from './projections/HiPS/HiPSProj.js';
import { Point } from './model/Point.js';
import { AbstractProjection } from './projections/AbstractProjection.js';
import { CutoutResult } from './model/CutoutResult.js';

import { HEALPixProjection } from './projections/HEALPixProjection.js';
import { FITS } from './model/FITS.js';
import { FITSList } from './projections/HiPS/FITSList.js';
import { HiPSFITS } from './projections/HiPS/HiPSFITS.js';

export class WCSLight {

    static async cutoutToHips(center: Point, radius: number,
        pxsize: number, filePath: string): Promise<FITSList | null> {

        const inProjection = await WCSLight.extractProjectionType(filePath)
        if (!inProjection) return null

        const tilesRaDecList = HiPSProj.getImageRADecList(center, radius, pxsize)
        if (!tilesRaDecList) {
            return null
        }

        const inputPixelsList = inProjection.world2pix(tilesRaDecList.getRaDecList())
        const invalues = await inProjection.getPixValues(inputPixelsList)
        const fitsHeaderParams = inProjection.getCommonFitsHeaderParams();

        if (invalues !== undefined) {
            const fitsFileList = HiPSProj.getFITSFiles(invalues, tilesRaDecList, fitsHeaderParams, pxsize);
            return fitsFileList
        }

        return null
    }

    static async extractProjectionType(filePath: string): Promise<AbstractProjection | null> {
        let fits: FITSParsed | null = await FITSParser.loadFITS(filePath)
        if (!fits) return null
        const ctype = String(fits.header.findById("CTYPE1")?.value)
        if (ctype.includes("MER")){
            return new MercatorProjection()
        }
        return null

    }

    static async hipsCutout(center: Point, radius: number,
        pxsize: number, baseHiPSURL: string, outproj: AbstractProjection, isGalactic: boolean = false ): Promise<CutoutResult | null> {
        
        const outRADecList: Array<Array<number>> = outproj.getImageRADecList(center, radius, pxsize)
        if (!outRADecList) return null
        const inputPixelsList = HiPSProj.world2pix(outRADecList, pxsize, isGalactic)
        const invalues = await HiPSProj.getPixelValues(inputPixelsList, baseHiPSURL);
        const fitsHeaderParams = HiPSProj.getCommonFitsHeaderParams();
        const fitsdata = outproj.setPxsValue(invalues, fitsHeaderParams);

        return null
    }

    static hipsFITSChangeProjection(): HiPSFITS | null {

        return null
    }

    static async cutout(center: Point, radius: number,
        pxsize: number, inproj: AbstractProjection, outproj: AbstractProjection): Promise<CutoutResult> {

        // HIPS out
        // MER in
        const outRADecList: Array<Array<number>> = outproj.getImageRADecList(center, radius, pxsize);
        if (outRADecList.length == 0) {
            const res: CutoutResult = {
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
        const fitsParsed = {
            header: fitsheader,
            data: fitsdata
        }
        // const blobUrl = FITSParser.generateFITSForWeb(fitsheader, fitsdata);
        const blobUrl = FITSParser.generateFITSForWeb(fitsParsed);
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

