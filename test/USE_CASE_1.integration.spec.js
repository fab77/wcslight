import { FITSWriter } from 'jsfitsio';

import { HiPSProjection } from "../lib-esm/projections/HiPSProjection.js";
import { MercatorProjection } from "../lib-esm/projections/MercatorProjection.js";

import fs from 'node:fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


async function test01 () {
    console.log("[test01] USE CASE 1: Single File Processing:");
    console.log("[test01] USE CASE 1.0: retrieve pixel's values from FITS file in HiPS projection (single file: remote)");
    const hp = new HiPSProjection();
    const inputFile = "http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/Norder8/Dir40000/Npix47180.fits";
    console.log(`[test01] Loading file ${inputFile}`)

    const fits = await hp.initFromFile(inputFile)
    if (fits !== undefined) {
        console.log(`[test01] BITPIX: ${fits.header.get('BITPIX')}`);
        console.log(`[test01] NAXIS1: ${fits.header.get('NAXIS1')}`);
        console.log(`[test01] NAXIS2: ${fits.header.get('NAXIS2')}`);
        console.log(`[test01] payload bytes length ${fits.data.length * fits.data[0].length}`);

        const physicalValues = hp.extractPhysicalValues(fits);
        const fw = new FITSWriter();
        fw.run(fits.header, fits.data);

        fs.writeFile(__dirname + "/output/UC1_0_Npix47180.fits", fw._fitsData);
    }


    // hp.initFromFile(inputFile).then((fits) => {
    //     if (fits !== undefined) {
    //         console.log(`[test01] BITPIX: ${fits.header.get('BITPIX')}`);
    //         console.log(`[test01] NAXIS1: ${fits.header.get('NAXIS1')}`);
    //         console.log(`[test01] NAXIS2: ${fits.header.get('NAXIS2')}`);
    //         console.log(`[test01] payload bytes length ${fits.data.length * fits.data[0].length}`);
    
    //         const physicalValues = hp.extractPhysicalValues(fits);
    //         const fw = new FITSWriter();
    //         fw.run(fits.header, fits.data);
    
    //         fs.writeFile(__dirname + "/output/UC1_0_Npix47180.fits", fw._fitsData);
    //     }
    // }).catch((err) => console.log(err));
}


function test02 () {
    console.log("[test02] USE CASE 1.2: retrieve pixel's values from FITS file in Mercator projection (single file: local)");
    const mp = new MercatorProjection();
    const inputFile = __dirname+'/input/Mercator.fits';
    console.log(`[test02] Loading file ${inputFile}`)
    mp.initFromFile(inputFile).then((fits) => {
        if (fits !== undefined) {
            console.log(`[test02] BITPIX: ${fits.header.get('BITPIX')}`);
            console.log(`[test02] NAXIS1: ${fits.header.get('NAXIS1')}`);
            console.log(`[test02] NAXIS2: ${fits.header.get('NAXIS2')}`);
            console.log(`[test02] payload bytes length ${fits.data.length * fits.data[0].length}`);
    
            const physicalValues = mp.extractPhysicalValues(fits);
            const fw = new FITSWriter();
            fw.run(fits.header, fits.data);
            fs.writeFile(__dirname+"/output/UC1_2_Mercator.fits", fw._fitsData);
        }
    }).catch((err) => console.log(err));
    
}

console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
console.log("Running test 1/2 of USE CASE 1")
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
await test01();
console.log("@")
console.log("@")
console.log("@")
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
console.log("Running test 2/2 of USE CASE 1")
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
test02();