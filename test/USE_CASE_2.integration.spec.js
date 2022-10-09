import { FITSWriter } from 'jsfitsio';

import { CoordsType } from "../lib-esm/model/CoordsType.js";
import { NumberType } from "../lib-esm/model/NumberType.js";
import { Point } from "../lib-esm/model/Point.js";
import { HiPSProjection } from "../lib-esm/projections/HiPSProjection.js";

import fs from 'node:fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


console.log("USE CASE 2:  Retrieve HiPS Files by HiPS baseURL:");
console.log("USE CASE 2.0: Retrieve HiPS Files by remote baseURL and pxsize");
let hp = new HiPSProjection();
let pxsize = 0.001; // degrees
let inputFile = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/'
hp.initFromHiPSLocationAndPxSize(inputFile, pxsize);
let center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
let radiusDeg = 0.05;
let raDecList = hp.getImageRADecList(center, radiusDeg);

let inputPixelsList = hp.world2pix(raDecList);
let destDir = __dirname + '/output/UC2/2_0/';
let fileList = await hp.getFITSFiles(inputPixelsList, destDir)
for(let [path, fits] of fileList) {
    
    const fw = new FITSWriter();
    fw.run(fits.header, fits.data);
    fs.writeFile(path, fw._fitsData);
    console.log(`File written in ${path}`);

}

console.log("###################### ###################### ######################");
console.log("USE CASE 2.1: Retrieve HiPS Files by local baseURL and pxsize");

console.log(
"with AKARI/N60 as input, radius 1, pxsixe 0.0.5 (equivalent to order 5)," +
" and center = 28.8999684, 3.5179829 (degrees galactic) => Expected the following tiles: " +
" - Norder05/Dir0/Npix4461.fits"+
" - Norder05/Dir0/Npix4462.fits"+
" - Norder05/Dir0/Npix4463.fits"+
" - Norder05/Dir0/Npix4474.fits"+
" - Norder05/Dir0/Npix4472.fits"
);

// TODO handle HiPS in Galactic! check HiPS properties and pass to healpix the correct coords frame
hp = new HiPSProjection();
pxsize = 0.005; // degrees
let inputHiPSDir = '/Users/fgiordano/Desktop/dottorato/hips/skies.esac.esa.int/AKARI/N60';
hp.initFromHiPSLocationAndPxSize(inputHiPSDir, pxsize);
// center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 277.8877690, -1.9759278); // equatorial
center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 28.8999684, 3.5179829); // galactic 
radiusDeg = 1;
raDecList = hp.getImageRADecList(center, radiusDeg);
inputPixelsList = hp.world2pix(raDecList);
destDir = __dirname + '/output/UC2/2_1/';
fileList = await hp.getFITSFiles(inputPixelsList, destDir)
console.log(`found ${fileList.size} fits`)
for(let [path, fits] of fileList) {
    // console.log(path)
    const fw = new FITSWriter();
    fw.run(fits.header, fits.data);
    fs.writeFile(path, fw._fitsData);
    console.log(`File written in ${path}`);

}
console.log("Files stored in " + destDir);


console.log("###################### ###################### ######################");
console.log("USE CASE 2.2: Retrieve HiPS Files by remote baseURL and order")
hp = new HiPSProjection();
let order = 7; // degrees
hp.initFromHiPSLocationAndOrder('http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/', order);
center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
radiusDeg = 0.05;
raDecList = hp.getImageRADecList(center, radiusDeg);
inputPixelsList = hp.world2pix(raDecList);
destDir = __dirname + '/output/UC2/2_2/';
fileList = await hp.getFITSFiles(inputPixelsList, destDir)

console.log(`found ${fileList.size} fits`)
for(let [path, fits] of fileList) {
    const fw = new FITSWriter();
    fw.run(fits.header, fits.data);
    fs.writeFile(path, fw._fitsData);
    console.log(`File written in ${path}`);
}
console.log("Files stored in " + destDir);



console.log("###################### ###################### ######################");
console.log("USE CASE 2.3: Retrieve HiPS Files by local baseURL and order")
hp = new HiPSProjection();
order = 7; // degrees
hp.initFromHiPSLocationAndOrder('/Users/fgiordano/Desktop/dottorato/hips/skies.esac.esa.int/AKARI/N60', order);
center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 28.8999684, 3.5179829); // galactic 
radiusDeg = 0.0005;
raDecList = hp.getImageRADecList(center, radiusDeg);
inputPixelsList = hp.world2pix(raDecList);
destDir = __dirname + '/output/UC2/2_3/';
fileList = await hp.getFITSFiles(inputPixelsList, destDir)
console.log(`found ${fileList.size} fits`)
for(let [path, fits] of fileList) {
    const fw = new FITSWriter();
    fw.run(fits.header, fits.data);
    fs.writeFile(path, fw._fitsData);
    console.log(`File written in ${path}`);
}
console.log("Files stored in " + destDir);



