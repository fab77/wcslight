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


    console.log("USE CASE 3: CutOut HiPS to MER:");
    console.log("USE CASE 3.0: cutout with remote HiPS from pixel size");
    let in_hp = new HiPSProjection();
    let in_pxsize = 0.001;
    let hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
    in_hp.parsePropertiesFile(hipsBaseUrl).then(propFile => {
        in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)
        let out_mp = new MercatorProjection();
        let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);

        let radius = 0.5;
        let out_pxsize = 0.0005;
        WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp).then(cutoutResult => {
            let firstHeader = cutoutResult.fitsheader[0];
            let firstData = cutoutResult.fitsdata.get(0);
            let destDir = __dirname + '/output/UC3/3_0/Mercator.fits';
            if (firstData !== undefined) {

                let fw = new FITSWriter();
                fw.run(firstHeader, firstData)
                fs.writeFile(destDir, fw._fitsData);
                console.log(`File written in ${destDir}`);

            } else {
                // TODO failed
            }
            console.log("Files stored in " + destDir);
        });

    });
}

function test02() {

    console.log("###################### ###################### ######################");
    console.log("USE CASE 3.1: cutout with local HiPS from pixel size")
    let in_hp = new HiPSProjection();
    let in_pxsize = 0.1;
    let inputHiPSDir = '/Users/fgiordano/Desktop/dottorato/hips/skies.esac.esa.int/AKARI/N60';
    in_hp.parsePropertiesFile(inputHiPSDir).then(propFile => {
        in_hp.initFromHiPSLocationAndPxSize(inputHiPSDir, in_pxsize)
        let out_mp = new MercatorProjection();
        let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 28.8999684, 3.5179829); // galactic 
        let radius = 1;
        let out_pxsize = 0.05;
        WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp).then(cutoutResult => {
            console.log(cutoutResult);
            let firstHeader = cutoutResult.fitsheader[0];
            let firstData = cutoutResult.fitsdata.get(0);
            let destFile = __dirname + '/output/UC3/3_1/Mercator.fits';
            if (firstData !== undefined) {
                let fw = new FITSWriter();
                fw.run(firstHeader, firstData)
                fs.writeFile(destFile, fw._fitsData);
                console.log(`File written in ${destFile}`);

            } else {
                // TODO failed
            }
            console.log("Files stored in " + destFile);
        });
    });
}

function test03() {

    console.log("###################### ###################### ######################");
    console.log("USE CASE 3.2: cutout with remote HiPS from HiPS order")
    let in_hp = new HiPSProjection();
    let order = 6;
    let hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
    in_hp.parsePropertiesFile(hipsBaseUrl).then(propFile => {
        in_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order)
        let out_mp = new MercatorProjection();
        let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
        let radius = 1;
        let out_pxsize = 0.0005;
        WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp).then(cutoutResult => {
            let data = cutoutResult.fitsdata.get(0);
            let header = cutoutResult.fitsheader[0];
            let destFile = __dirname + '/output/UC3/3_2/Mercator.fits';
            if (data !== undefined) {
                const fw = new FITSWriter();
                fw.run(header, data);
                fs.writeFile(destFile, fw._fitsData);
                console.log(`File written in ${destFile}`);
                // writeFITS("./test/output/UC3/3_2/Mercator.fits", fw._fitsData);
            } else {
                // TODO failed
            }
            return cutoutResult;
        })
    });
}

function test04() {

    // TODO read HiPS properties file to get the correct TileSize (hips_tile_width)
    console.log("###################### ###################### ######################");
    console.log("USE CASE 3.3: cutout with local HiPS from HiPS order")
    let in_hp = new HiPSProjection();
    let inputHiPSDir = '/Users/fgiordano/Desktop/dottorato/hips/skies.esac.esa.int/AKARI/N60';
    in_hp.parsePropertiesFile(inputHiPSDir).then(propFile => {
        console.log(propFile.toString('utf8'));
        let order = 7;
        in_hp.initFromHiPSLocationAndOrder(inputHiPSDir, order)
        let out_mp = new MercatorProjection();
        let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 28.8999684, 3.5179829); // galactic 
        let radius = 1;
        let out_pxsize = 0.005;
        WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp).then(cutoutResult => {
            let firstHeader = cutoutResult.fitsheader[0];
            let firstData = cutoutResult.fitsdata.get(0);
            let destFile = __dirname + '/output/UC3/3_3/Mercator.fits';
            if (firstData !== undefined) {
                let fw = new FITSWriter();
                fw.run(firstHeader, firstData)
                fs.writeFile(destFile, fw._fitsData);
                console.log(`File written in ${destFile}`);

            } else {
                // TODO failed
            }
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

// testX();

function testX() {
    let in_hp = new HiPSProjection();
    let in_pxsize = 0.001;
    let hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
    in_hp.parsePropertiesFile(hipsBaseUrl).then(async propFile => {
        in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)
        let out_mp = new MercatorProjection();
        let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);

        let radius = 0.05;
        let out_pxsize = 0.0005;

        const outRADecList = out_mp.getImageRADecList(centre, radius, out_pxsize);
        const inputPixelsList = in_hp.world2pix(outRADecList);

        const testInPx = in_hp.world2pix(
            [
                [248.3529, -36.6464],
                [248.32244, -36.598657],
                [248.38696, -36.626145],
                [248.35716, -36.689513]
            ]);
        const testInVal = await in_hp.getPixValues(testInPx);
        console.log(`testInVal ${testInVal}`);

        const invalues = await in_hp.getPixValues(inputPixelsList);

        const fitsHeaderParams = in_hp.getCommonFitsHeaderParams();
        if (invalues !== undefined) {
            const fitsdata = out_mp.setPxsValue(invalues, fitsHeaderParams);

            const testOutPx = out_mp.world2pix(
                [
                    [248.3529, -36.6464],
                    [248.32244, -36.598657],
                    [248.38696, -36.626145],
                    [248.35716, -36.689513]
                ]);
            const testOutVal = await out_mp.getPixValues(testOutPx);
            console.log(`testOutVal ${testOutVal}`);

            const fitsheader = out_mp.getFITSHeader();
            const res = {
                fitsheader: fitsheader,
                fitsdata: fitsdata,
                inproj: in_hp,
                outproj: out_mp
            };
            return res;
        }
    });
}