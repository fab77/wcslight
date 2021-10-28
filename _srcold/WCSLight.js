"use strict";

import HiPSProjection from "./projections/HiPSProjection";
import MercatorProjection from "./projections/MercatorProjection";
import FITSParser from "fitsparser";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

class WCSLight {

    /** @constructs WCSLight */
    constructor () {}

    /**
     * cutout use case
     * @example <caption> </caption>
     * cutout({"raDeg" : 21, "decDeg" : 19}, 0.001, 0.0005, "HiPS", "Mercator");
     * @param {Object} center e.g. {"raDeg" : 21, "decDeg" : 19}
     * @param {number} radius radius in decimal degrees
     * @param {number} pxsize pixel size in decimal degrees
     * @param {string} inprojname 
     * @param {string} outprojname 
     * @param {string[]} [filelist]
     * @param {string} [baseuri] e.g. "http://<base hips URL> or <base file system dir>";
     * @returns {Image}
     */
    static cutout (center, radius, pxsize, inproj, outproj) {
        
        let result = [];
        // todo this should return a map. one key per output file ra, dec map
        // in case of out mercator, the map will contains only 1 key
        let outRADecMap = outproj.getImageRADecList(center, radius, pxsize);     
        for (const [key, value] of outRADecMap) {
            let outRADecList = value;
            // start here a loop over outRADecList (which is a Map)
            // outRADecMAP.foreach(outRADecList){
            let inputPixelsList = inproj.world2pix(outRADecList);

            let invalues = inproj.getPixValuesFromPxlist(inputPixelsList);
            let fitsHeaderParams = inproj.getFITSHeader();

            let fitsdata = outproj.setPxsValue(invalues, fitsHeaderParams, key);
            let fitsheader = outproj.getFITSHeader();
            let canvas2d = outproj.getCanvas2d();
            result.push({
                "fitsheader": fitsheader,
                "fitsdata": fitsdata,
                "canvas2d": canvas2d
            });
        }
        
        return result;

    }

    /**
     * 
     * @param {*} fitsheader 
     * @param {*} fitsdata 
     * @returns {URL}
     */
    static writeFITS(fitsheader, fitsdata) {
        let encodedData = FITSParser.writeFITS(fitsheader, fitsdata);
        return encodedData;
    }

    


    static changeProjection (filepath, outprojname) {
        // TODO
    }


    static getProjection(projectionName, filepathlist) {
        if (projectionName === "Mercator") {
            return new MercatorProjection();
        } else  if (projectionName === "HiPS") {
            return new  HiPSProjection();
        } else  if (projectionName === "HEALPix") {
            return new  HEALPixProjection();
        } else {
            throw new ProjectionNotFound(projectionName);
        }
    }


}

export default WCSLight;