"use strict";

import Canvas2D from "./model/Canvas2D";
import Cutout from "./services/Cutout";

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
     * @returns {Object {"FITSHeader", "FITSData"}}
     */
    static cutout (center, radius, pxsize, inprojname, outprojname, filelist, baseuri) {
        if (!filelist && !baseuri) {
            throw new Error("Missing either filelist or baseuri. Check input param.");
        }
        
        let initparam = {
            "action": "cutout",
            "center": center,
            "pxsize": pxsize,
            "radius": radius
        }

        // 0. INSTANZIATE IN PROJECTION BY PASSING center, radius and pxsize(e.g {"ra": 21, "dec": 19}, 0.001, 0.0005)
        let inproj = WCSLight.getProjection(inprojname);
        inproj.init(initparam);
    
        // 1. INSTANZIATE OUTPUT PROJECTION IN THE SAME WAY
        let outproj = WCSLight.getProjection(outprojname);
        outproj.init(initparam);
        
        // 2. (output preparation) GET FROM OUTPUT PROJECTION THE outputImageMap CONATINING THE OUTPUT PIXEL MATRIX [naxis1 x naxis2] ImagePx (ra, dec, i, j)
        // <-- TODO change method name to getImagePixelList
        let outputImageMap = outproj.getOutputImageMap(); 
    
        // 3. (input organization) USING THE outputImageMap ORGANIZE ImagePixels IN A map PER TILE NUMBER (ONLY FOR HiPS PROJECTION). 
        // TODO <-- this is HiPS specific. change method name to something like optimizePixelsOrder
        let tilesMap = inproj.generateTilesMap(outputImageMap); 
    
        // 4. GENERATE THE FINAL EMPTY Image PASSING THE outproj (AND CONSEQUENTLY naxis1, naxis2 DEFINED IN outproj)
        let outimage = new Image(outproj);

        // 5. INSTANZIATE THE UTILITY cutout
        let cutout = new Cutout(outimage, inproj);
        
        
        if (!filelist) {
            
            if (typeof inproj === "HiPSProjection" && baseuri) {
                baseuri = baseuri+"/"+inproj.getNorder(); // TODO getNorder
            }    

            // 6. ITERATE OVER TILE ON tileMap TO 
            tilesMap.forEach(function(pixelsArray, tileno) {
                //  6.1 CALL FITSParser TO LOAD AND PARSE THE CORRESPONDING FITS
                let fits = new FITSParser(baseuri+"/Dir***"+key+".fits"); // TODO compute Dir***
                fitsheader = fits.header;
                fitsdata = fits.data;
                // TODO? avoid passing "tileno" to wcsl.fillOutputImage, the FITS HEADER should contain Npix<X>
                headerinfo = {
                    "min" : fitsheader.getValue("DATAMIN"),
                    "max" : fitsheader.getValue("DATAMAX"),
                    "blank" : fitsheader.getValue("BLANK"),
                    "bscale" : fitsheader.getValue("BSCALE"),
                    "bzero" : fitsheader.getValue("BZERO"),
                    "bitpix" : fitsheader.getValue("BITPIX")
                }
                //  6.2 PASS [fitsheader, fitsdata] TO THE UTILITY WCSLight.cutout TO FILL image created at point 5
                cutout.fillOutputImage(fitsdata, headerinfo, tileno);
            });

        } else {
            // 6. ITERATE OVER FILES
            filelist.forEach(function(filepath) {
                //  6.1 CALL FITSParser TO LOAD AND PARSE THE CORRESPONDING FITS
                let fits = new FITSParser(filepath);
                fitsheader = fits.header;
                fitsdata = fits.data;
                headerinfo = {
                    "min" : fitsheader.getValue("DATAMIN"),
                    "max" : fitsheader.getValue("DATAMAX"),
                    "blank" : fitsheader.getValue("BLANK"),
                    "bscale" : fitsheader.getValue("BSCALE"),
                    "bzero" : fitsheader.getValue("BZERO"),
                    "bitpix" : fitsheader.getValue("BITPIX")
                }
                //  6.2 PASS [fitsheader, fitsdata] TO THE UTILITY WCSLight.cutout TO FILL image created at point 5
                cutout.fillOutputImage(fitsdata, headerinfo, tileno);
            });
        }

        // 7. GET THE PROCESSED IMAGE
        outimage = cutout.getFinalImage();
        return outimage;

    }

    static writeFITS(fitsheader, fitsdata) {
        let encodedData = FITSParser.writeFITS(fitsheader, fitsdata);
        return encodedData;
    }

    /**
     * 
     * @param {string} filepath 
     * @param {string} projname 
     * @returns {Canvas2D}
     */
    static getCanvas2d(filepath, projname) {

        let fits = new FITSParser(filepath);
        let fitsheader = fits.header;
        let fitsdata = fits.data;
        
        let initparam = {
            "action": "canvas2d",
            "nside": fitsheader.nside,
            "tileno": fitsheader.pixno,
            "naxis1": fitsheader.naxis1,
            "naxis2": fitsheader.naxis2
        }

        let proj = WCSLight.getProjection(projname);
        proj.init(initparam);

        let canvas = new Canvas2D(fitsheader.pvmin, fitsheader.pvmax, fitsdata);
        return canvas;

    }


    // getInProjection () {
    //     return this._inproj;
    // }


    // getOutProjection () {
    //     return this._outproj;
    // }

    
    
    // getOutputImageMap() {
    //     return this._outImageMap;
    // }

    static getProjection(projectionName) {
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

    
    static transformService (fitsheader, fitsdata, inproj, outproj) {

    }

    static cutoutService (outimage, inprojection) {

        return new Cutout(outimage, inprojection);
    }
}

export default WCSLight;