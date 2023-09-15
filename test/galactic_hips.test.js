import { FITSParser, FITSHeader, FITSWriter } from "jsfitsio";

import { CoordsType } from "../lib-esm/model/CoordsType.js";
import { NumberType } from "../lib-esm/model/NumberType.js";
import { Point } from "../lib-esm/model/Point.js";
import { HiPSProjection } from "../lib-esm/projections/HiPSProjection.js";
import { MercatorProjection } from "../lib-esm/projections/MercatorProjection.js";


import { WCSLight } from '../lib-esm/WCSLight.js';

import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function test01() {

    // hipsBaseUri = "http://skies.esac.esa.int/NVSS/";
    const hipsBaseUri = "http://skies.esac.esa.int/AKARI/N160/";
    const radius_arc_sec = 90.6;
    const pxsize_arc_sec = 1.5;
    const radius_deg = radius_arc_sec / 3600;
    const pxsize_deg = pxsize_arc_sec / 3600;
    const radeg = 312.415333;
    const decdeg = 29.608056;
  
    const center = new Point(CoordsType.ASTRO, NumberType.DEGREES, radeg, decdeg);
    let inproj = new HiPSProjection();

    inproj.parsePropertiesFile(hipsBaseUri).then(async propFile => {
        inproj.initFromHiPSLocationAndPxSize(hipsBaseUri, pxsize_deg);

        // console.log(inproj)

        let outproj = new MercatorProjection();

        console.log("ra %s, dec %s, px_size %s, radius %s",radeg, decdeg, pxsize_deg, radius_deg)
        WCSLight.cutout(center, radius_deg, pxsize_deg, inproj, outproj).then(cutoutResult => {
            // console.log(cutoutResult);

            if (cutoutResult.fitsused.length > 0){
                console.log(cutoutResult);
                return cutoutResult;
            } else {
                console.error("no data found");
            }

        });
        
    
    });
  

  
  

    // console.log("USE CASE 3: CutOut HiPS to MER:");
    // console.log("USE CASE 3.0: cutout with remote HiPS from pixel size");
    // let in_hp = new HiPSProjection();
    // let in_pxsize = 0.0005;
    // // let hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
    // let hipsBaseUrl = 'https://skies.esac.esa.int/Herschel/PACS100/';
    // in_hp.parsePropertiesFile(hipsBaseUrl).then(async propFile => {
    //     in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)
    //     let out_mp = new MercatorProjection();
    //     // 83.4816 -7.4525
    //     let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 83.4816, -7.4525);

    //     let radius = 0.1;
    //     let out_pxsize = 0.0005;
    //     WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp).then(cutoutResult => {
    //         let firstHeader = cutoutResult.fitsheader[0];
    //         let firstData = cutoutResult.fitsdata.get(0);
    //         let destDir = __dirname + '/output/newtest/Mercator.fits';
    //         if (firstData !== undefined) {

    //             let fw = new FITSWriter();
    //             fw.run(firstHeader, firstData)
    //             fs.writeFile(destDir, fw._fitsData);
    //             console.log(`File written in ${destDir}`);

    //         } else {
    //             // TODO failed
    //         }
    //         console.log("Files stored in " + destDir);
    //     });

    // });
}

test01();