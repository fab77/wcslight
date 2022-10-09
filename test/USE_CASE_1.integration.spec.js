import { FITSWriter } from 'jsfitsio';

import { HiPSProjection } from "../lib-esm/projections/HiPSProjection.js";
import { MercatorProjection } from "../lib-esm/projections/MercatorProjection.js";

import fs from 'node:fs/promises';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("USE CASE 1: Single File Processing:");
console.log("USE CASE 1.0: retrieve pixel's values from FITS file in HiPS projection (single file: remote)");
let hp = new HiPSProjection();
let physicalValues;
let inputFile = "http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/Norder8/Dir40000/Npix47180.fits";
console.log(`Loading file ${inputFile}`)
hp.initFromFile(inputFile).then((fits) => {
    if (fits !== undefined) {
        console.log(`BITPIX: ${fits.header.get('BITPIX')}`);
        console.log(`NAXIS1: ${fits.header.get('NAXIS1')}`);
        console.log(`NAXIS2: ${fits.header.get('NAXIS2')}`);
        console.log(`payload bytes length ${fits.data.length * fits.data[0].length}`);

        physicalValues = hp.extractPhysicalValues(fits);
        const fw = new FITSWriter();
        fw.run(fits.header, fits.data);

        fs.writeFile(__dirname + "/output/UC1_0_Npix47180.fits", fw._fitsData);
    }
}).catch((err) => console.log(err));


// console.log(__dirname);
// console.log(__dirname+'/input/Mercator.fits');
console.log("###################### ###################### ######################");
console.log("USE CASE 1.2: retrieve pixel's values from FITS file in Mercator projection (single file: local)");
let mp = new MercatorProjection();
inputFile = __dirname+'/input/Mercator.fits';
console.log(`Loading file ${inputFile}`)
mp.initFromFile(inputFile).then((fits) => {
    if (fits !== undefined) {
        let physicalValues = mp.extractPhysicalValues(fits);
        const fw = new FITSWriter();
        fw.run(fits.header, fits.data);
        fs.writeFile(__dirname+"/output/UC1_2_Mercator.fits", fw._fitsData);
    }
}).catch((err) => console.log(err));
