"use strict";
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
        let outRADecList = outproj.getImageRADecList(center, radius, pxsize);     
    
        /** PROMISE PROTO */
        // world2pix must load files
        let inputPixelsList = inproj.world2pix(outRADecList);
        return inproj.getPixValues(inputPixelsList).then((invalues) => {
            let fitsHeaderParams = inproj.getFITSHeader();
            // TODO separate fitsHeaderParams in a different method
            // outproj.prepareFITSHEader(fitsHeaderParams)
            let fitsdata = outproj.setPxsValue(invalues, fitsHeaderParams);
            let fitsheader = outproj.getFITSHeader();
            let canvas2d = outproj.getCanvas2d();
            return {
                "fitsheader": fitsheader,
                "fitsdata": fitsdata,
                "canvas2d": canvas2d
            };
        });
        /** END PROMISE PROTO*/
        // let inputPixelsList = inproj.world2pix(outRADecList);

        // let invalues = inproj.getPixValuesFromPxlist(inputPixelsList);
        // let fitsHeaderParams = inproj.getFITSHeader();

        // // TODO separate fitsHeaderParams in a different method
        // // outproj.prepareFITSHEader(fitsHeaderParams)
        // let fitsdata = outproj.setPxsValue(invalues, fitsHeaderParams);
        
        // let fitsheader = outproj.getFITSHeader();
        // let canvas2d = outproj.getCanvas2d();
        
        // return {
        //     "fitsheader": fitsheader,
        //     "fitsdata": fitsdata,
        //     "canvas2d": canvas2d
        // };

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