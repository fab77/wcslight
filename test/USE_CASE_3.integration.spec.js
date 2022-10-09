import { FITSParser, FITSHeader, FITSWriter } from "jsfitsio";

import { CoordsType } from "../lib-esm/model/CoordsType.js";
import { NumberType } from "../lib-esm/model/NumberType.js";
import { Point } from "../lib-esm/model/Point.js";
import { HiPSProjection } from "../lib-esm/projections/HiPSProjection.js";
import { MercatorProjection } from "../lib-esm/projections/MercatorProjection.js";


import { WCSLight} from '../lib-esm/WCSLight.js';

import fs from 'node:fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// console.log("USE CASE 3: CutOut HiPS to MER:");
// console.log("USE CASE 3.0: cutout with remote HiPS from pixel size");
// let in_hp = new HiPSProjection();
// let in_pxsize = 0.001;
// let hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
// in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)
// let out_mp = new MercatorProjection();
// let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
// let radius = 0.05;
// let out_pxsize = 0.0005;
// let cutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp);
// console.log(cutoutResult)
// let firstHeader = cutoutResult.fitsheader[0];
// let firstData = cutoutResult.fitsdata.get(0);
// let destDir = __dirname + '/output/UC3/3_0/Mercator.fits';
// if (firstData !== undefined) {
//     let fw = new FITSWriter();
//     fw.run(firstHeader, firstData)    
//     fs.writeFile(destDir, fw._fitsData);
//     console.log(`File written in ${path}`);

// } else{
//     // TODO failed
// }
// console.log("Files stored in " + destDir);



console.log("###################### ###################### ######################");
console.log("USE CASE 3.1: cutout with local HiPS from pixel size")
let in_hp = new HiPSProjection();
let in_pxsize = 0.005;
let inputHiPSDir = '/Users/fgiordano/Desktop/dottorato/hips/skies.esac.esa.int/AKARI/N60';
in_hp.initFromHiPSLocationAndPxSize(inputHiPSDir, in_pxsize)
let out_mp = new MercatorProjection();
let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 28.8999684, 3.5179829); // galactic 
let radius = 1;
let out_pxsize = 0.005;
let cutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp);
console.log(cutoutResult);
let firstHeader = cutoutResult.fitsheader[0];
let firstData = cutoutResult.fitsdata.get(0);
let destDir = __dirname + '/output/UC3/3_1/Mercator.fits';
if (firstData !== undefined) {
    let fw = new FITSWriter();
    fw.run(firstHeader, firstData)    
    fs.writeFile(destDir, fw._fitsData);
    console.log(`File written in ${path}`);

} else{
    // TODO failed
}
console.log("Files stored in " + destDir);

// return cuoutResult;


// console.log("###################### ###################### ######################");
// console.log("USE CASE 3.2: cutout with remote HiPS from HiPS order")
// in_hp = new HiPSProjection();
// let order = 8;
// hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
// in_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order)
// out_mp = new MercatorProjection();
// centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
// radius = 0.05;
// out_pxsize = 0.0005;
// cutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp);
// let data = cutoutResult.fitsdata.get(0);
// let header = cutoutResult.fitsheader[0];
// if (data !== undefined) {
//     const fw = new FITSWriter();
//     fw.run(header, data);
//     writeFITS("./test/output/UC3/3_2/Mercator.fits", fw._fitsData);
// } else{
//     // TODO failed
// }
// // return cutoutResult;


// console.log("###################### ###################### ######################");
// console.log("USE CASE 3.3: cutout with local HiPS from HiPS order")
// in_hp = new HiPSProjection();
// order = 7;
// hipsBaseUrl = '/local-hips-basedir/';
// in_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order)
// out_mp = new MercatorProjection();
// centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
// radius = 0.0001;
// out_pxsize = 0.001;
// cutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp);
// // return cuoutResult;





