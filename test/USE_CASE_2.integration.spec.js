import { FITSWriter } from 'jsfitsio';

import { CoordsType } from "../lib-esm/model/CoordsType.js";
import { NumberType } from "../lib-esm/model/NumberType.js";
import { Point } from "../lib-esm/model/Point.js";
import { HiPSProjection } from "../lib-esm/projections/HiPSProjection.js";

import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function test01() {
    console.log("[test01] USE CASE 2:  Retrieve HiPS Files by HiPS baseURL:");
    console.log("[test01] USE CASE 2.0: Retrieve HiPS Files by remote baseURL and pxsize");
    const baseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/'
    const hp = new HiPSProjection();
    hp.parsePropertiesFile(baseUrl).then(propFile => {
        const pxsize = 0.001; // degrees

        hp.initFromHiPSLocationAndPxSize(baseUrl, pxsize);
        const center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
        const radiusDeg = 0.05;
        const raDecList = hp.getImageRADecList(center, radiusDeg);

        const inputPixelsList = hp.world2pix(raDecList);
        const destDir = __dirname + '/output/UC2/2_0/';
        hp.getFITSFiles(inputPixelsList, destDir).then((fileList) => {
            for (let [path, fits] of fileList) {

                const fw = new FITSWriter();
                fw.run(fits.header, fits.data);
                fs.writeFile(path, fw._fitsData);
                console.log(`[test01] File written in ${path}`);

            }
        });
    });

}


function test02() {

    console.log("[test02] USE CASE 2.1: Retrieve HiPS Files by local baseURL and pxsize");

    console.log(
        "[test02] with AKARI/N60 as input, radius 1, pxsixe 0.0.5 (equivalent to order 5)," +
        " and center = 28.8999684, 3.5179829 (degrees galactic) => Expected the following tiles: " +
        " - Norder05/Dir0/Npix4461.fits" +
        " - Norder05/Dir0/Npix4462.fits" +
        " - Norder05/Dir0/Npix4463.fits" +
        " - Norder05/Dir0/Npix4474.fits" +
        " - Norder05/Dir0/Npix4472.fits"
    );

    // TODO handle HiPS in Galactic! check HiPS properties and pass to healpix the correct coords frame
    const hp = new HiPSProjection();
    const pxsize = 0.05; // degrees
    const inputHiPSDir = '/Users/fgiordano/Desktop/dottorato/hips/skies.esac.esa.int/AKARI/N60';
    hp.parsePropertiesFile(inputHiPSDir).then(propFile => {
        hp.initFromHiPSLocationAndPxSize(inputHiPSDir, pxsize);
        // center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 277.8877690, -1.9759278); // equatorial
        const center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 28.8999684, 3.5179829); // galactic 
        const radiusDeg = 1;
        const raDecList = hp.getImageRADecList(center, radiusDeg);
        const inputPixelsList = hp.world2pix(raDecList);
        const destDir = __dirname + '/output/UC2/2_1/';
        hp.getFITSFiles(inputPixelsList, destDir).then((fileList) => {
            console.log(`[test02] found ${fileList.size} fits`)
            for (let [path, fits] of fileList) {
                // console.log(path)
                const fw = new FITSWriter();
                fw.run(fits.header, fits.data);
                fs.writeFile(path, fw._fitsData);
                console.log(`[test02] File written in ${path}`);

            }
            console.log("[test02] Files stored in " + destDir);
        });
    });
}


function test03() {
    console.log("[test03] USE CASE 2.2: Retrieve HiPS Files by remote baseURL and order")
    const hp = new HiPSProjection();
    const order = 7; // degrees

    const baseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/'
    hp.parsePropertiesFile(baseUrl).then(propFile => {

        hp.initFromHiPSLocationAndOrder(baseUrl, order);
        const center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
        const radiusDeg = 0.05;
        const raDecList = hp.getImageRADecList(center, radiusDeg);
        const inputPixelsList = hp.world2pix(raDecList);
        const destDir = __dirname + '/output/UC2/2_2/';
        hp.getFITSFiles(inputPixelsList, destDir).then((fileList) => {
            console.log(`[test03] found ${fileList.size} fits`)
            for (let [path, fits] of fileList) {
                const fw = new FITSWriter();
                fw.run(fits.header, fits.data);
                fs.writeFile(path, fw._fitsData);
                console.log(`[test03] File written in ${path}`);
            }
            console.log("[test03] Files stored in " + destDir);
        });
    });


}

function test04() {
    console.log("[test04] USE CASE 2.3: Retrieve HiPS Files by local baseURL and order")
    const hp = new HiPSProjection();
    const order = 7; // degrees

    const inputHiPSDir = '/Users/fgiordano/Desktop/dottorato/hips/skies.esac.esa.int/AKARI/N60';
    hp.parsePropertiesFile(inputHiPSDir).then(propFile => {

        hp.initFromHiPSLocationAndOrder(inputHiPSDir, order);
        const center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 28.8999684, 3.5179829); // galactic 
        const radiusDeg = 1;
        const raDecList = hp.getImageRADecList(center, radiusDeg);
        const inputPixelsList = hp.world2pix(raDecList);
        const destDir = __dirname + '/output/UC2/2_3/';
        hp.getFITSFiles(inputPixelsList, destDir).then((fileList) => {
            console.log(`[test04] found ${fileList.size} fits`)
            for (let [path, fits] of fileList) {
                const fw = new FITSWriter();
                fw.run(fits.header, fits.data);
                fs.writeFile(path, fw._fitsData);
                console.log(`[test04] File written in ${path}`);
            }
            console.log("[test04] Files stored in " + destDir);
        });
    });
}


console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
console.log("Running test 1/4 of USE CASE 2")
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
test01();
console.log("@")
console.log("@")
console.log("@")
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
console.log("Running test 2/4 of USE CASE 2")
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
test02();
console.log("@")
console.log("@")
console.log("@")
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
console.log("Running test 3/4 of USE CASE 2")
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
test03();
console.log("@")
console.log("@")
console.log("@")
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
console.log("Running test 4/4 of USE CASE 2")
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
test04();