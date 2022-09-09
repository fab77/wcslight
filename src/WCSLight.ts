"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
 
 import {MercatorProjection} from './projections/MercatorProjection';
 import {HiPSProjection} from './projections/HiPSProjection';
import {Point} from './model/Point';
import {AbstractProjection} from './projections/AbstractProjection';
import { CutoutResult } from './model/CutoutResult';

import { FITSParser } from '../../FITSParser-test-20220905/src/FITSParser-node';

import { HEALPixProjection } from './projections/HEALPixProjection';
import {GnomonicProjection} from './projections/GnomonicProjection';

export class WCSLight {

    /** @constructs WCSLight */
    constructor () {}

    static async cutout (center: Point, radius: number, 
        pxsize: number, inproj: AbstractProjection, outproj: AbstractProjection): Promise<CutoutResult> {
        
        const outRADecList:Array<Array<number>> = outproj.getImageRADecList(center, radius, pxsize);
        const inputPixelsList = inproj.world2pix(outRADecList);
        try {
            
            const invalues = await inproj.getPixValues(inputPixelsList);
            const fitsHeaderParams = inproj.getCommonFitsHeaderParams();
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
    static writeFITS(fitsheader: any, fitsdata: any, fileuri): void {
        FITSParser.writeFITS(fitsheader, fitsdata, fileuri);
        // let encodedData = FITSParser.writeFITS(fitsheader, fitsdata, fileuri);
        // return encodedData;
    }

    


    static changeProjection (filepath, outprojname) {
        // TODO
    }


    static getProjection(projectionName: string) {
        if (projectionName === "Mercator") {
            return new MercatorProjection();
        } else  if (projectionName === "HiPS") {
            return new  HiPSProjection();
        } else  if (projectionName === "HEALPix") {
            return new  HEALPixProjection();
        } else  if (projectionName === "Gnomonic") {
            return new  GnomonicProjection();
        } else {
            return null;
            // throw new ProjectionNotFound(projectionName);
        }
    }

    static getAvaillableProjections() {
        return ["Mercator", "HiPS", "HEALPix"];
    }

}

export default WCSLight;