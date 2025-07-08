// import { FITSParser, FITSHeader, FITSWriter } from "jsfitsio";
import { FITSParser, FITSHeaderManager, FITSWriter } from "jsfitsio";

import { CoordsType } from "../lib-esm/model/CoordsType.js";
import { NumberType } from "../lib-esm/model/NumberType.js";
import { Point } from "../lib-esm/model/Point.js";
// import { HiPSProjection } from "../lib-esm/projections/HiPSProjection.js";
// import { MercatorProjection } from "../lib-esm/projections/MercatorProjection.js";


import { WCSLight } from '../lib-esm/WCSLight.js';

import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { MercatorProjection } from "../lib-esm/projections/mercator/MercatorProjection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function test01() {


    console.log("USE CASE 3: CutOut HiPS to MER:");
    console.log("USE CASE 3.0: cutout with remote HiPS from pixel size");
    let in_hp = new HiPSProjection();
    let in_pxsize = 0.8;
    // let hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
    // let hipsBaseUrl = 'https://skies.esac.esa.int/Herschel/PACS100/';
    let hipsBaseUrl = 'https://alasky.cds.unistra.fr/GALEX/GALEXGR6_7_FUV/';

    in_hp.parsePropertiesFile(hipsBaseUrl).then(async propFile => {
        in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)
        let out_mp = new MercatorProjection();
        // 83.4816 -7.4525
        let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 185.25937499999998, 3.722138888888889);

        let radius = 519.60;
        let out_pxsize = 0.8;
        WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp).then(cutoutResult => {
            if (cutoutResult.fitsheader) {
                let firstHeader = cutoutResult.fitsheader[0];
                let firstData = cutoutResult.fitsdata.get(0);
                let destDir = __dirname + '/output/newtest/Mercator.fits';
                if (firstData !== undefined) {
    
                    let fw = new FITSWriter();
                    fw.run(firstHeader, firstData)
                    fs.writeFile(destDir, fw._fitsData);
                    console.log(`File written in ${destDir}`);
    
                } 
                console.log("Files stored in " + destDir);
            } else {
                console.warn("No data found");
            }
            
            
        });

    });
}
async function testNaNFits() {
    console.log("USE CASE 3: CutOut HiPS to MER:");
    console.log("USE CASE 3.0: cutout with remote HiPS from pixel size");
    let in_hp = new HiPSProjection();
    const pxsize = 0.005;
    // let hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
    // let hipsBaseUrl = 'https://skies.esac.esa.int/Herschel/PACS100/';
    let hipsBaseUrl = 'https://alasky.cds.unistra.fr/GALEX/GALEXGR6_7_FUV/';

    const propFile = await in_hp.parsePropertiesFile(hipsBaseUrl)
    in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, pxsize)
    let out_mp = new MercatorProjection()
    let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 246.6026, -24.4074)
    const radius = 0.2
    
    const cutoutResult = await WCSLight.cutout(centre, radius, pxsize, in_hp, out_mp)
    if (cutoutResult.fitsheader) {
        let firstHeader = cutoutResult.fitsheader[0];
        let firstData = cutoutResult.fitsdata.get(0);
        // let firstData = cutoutResult.fitsdata[0];
        let destDir = __dirname + '/output/newtest/Mercator.fits';
        if (firstData !== undefined) {

            const fits = {header: cutoutResult.fitsheader[0], data: cutoutResult.fitsdata.get(0)};
            // let fw = new FITSWriter();
            // fw.run(firstHeader, firstData)
            // fs.writeFile(destDir, fw._fitsData);
            FITSWriter.writeFITSFile(fits, destDir);
            console.log(`File written in ${destDir}`);

        } 
        console.log("Files stored in " + destDir);
    } else {
        console.warn("No data found");
    }
}


async function testFits() {
    console.log("USE CASE 3: CutOut HiPS to MER:");
    console.log("USE CASE 3.0: cutout with remote HiPS from pixel size");
    let in_hp = new HiPSProjection();
    const pxsize = 0.005;
    // let hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
    let hipsBaseUrl = 'https://skies.esac.esa.int/Herschel/PACS160/';
    // let hipsBaseUrl = 'https://alasky.cds.unistra.fr/GALEX/GALEXGR6_7_FUV/';

    const propFile = await in_hp.parsePropertiesFile(hipsBaseUrl)
    in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, pxsize)
    let out_mp = new MercatorProjection()
    let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 246.6324, -24.4001)
    let radius = 2.0

    const cutoutResult = await WCSLight.cutout(centre, radius, pxsize, in_hp, out_mp)
    if (cutoutResult.fitsheader) {
        let firstHeader = cutoutResult.fitsheader[0];
        let firstData = cutoutResult.fitsdata.get(0);
        // let firstData = cutoutResult.fitsdata[0];
        let destDir = __dirname + '/output/newtest/Mercator.fits';
        if (firstData !== undefined) {

            let fw = new FITSWriter();
            fw.run(firstHeader, firstData)
            fs.writeFile(destDir, fw._fitsData);
            console.log(`File written in ${destDir}`);

        } 
        console.log("Files stored in " + destDir);
    } else {
        console.warn("No data found");
    }
}


function computeOrder(pxAngSizeDeg, pxTileWidth) {
    console.log(`Computing HiPS order having pixel angular size of ${pxAngSizeDeg} in degrees`)
    const deg2rad = Math.PI / 180
    const pxAngSizeRad = pxAngSizeDeg * deg2rad
    console.log(`pixel angular res in radians ${pxAngSizeRad}`)
    const computedOrder = Math.floor(0.5 * Math.log2 ( Math.PI / (3 * pxAngSizeRad * pxAngSizeRad * pxTileWidth * pxTileWidth) ))
    console.log(`Order ${computedOrder}`)
    return computeOrder
}

function computePxAngSize(pxTileWidth, order) {
    const computedPxAngSizeRadiant = Math.sqrt( 4 * Math.PI / (12 * (pxTileWidth * (2**order) )**2 ) )
    console.log(`Computing Pixel size with tile of ${pxTileWidth} pixels and order ${order}`)
    const rad2deg = 180 / Math.PI
    const deg = computedPxAngSizeRadiant * rad2deg
    const arcmin = computedPxAngSizeRadiant * rad2deg * 60
    const arcsec = computedPxAngSizeRadiant * rad2deg * 3600
    console.log ("Pixel size in radiant:" + computedPxAngSizeRadiant)
    console.log ("Pixel size in degrees:" + deg)
    console.log ("Pixel size in arcmin:" + arcmin)
    console.log ("Pixel size in arcsec:" + arcsec)
    return {
        "rad": computedPxAngSizeRadiant,
        "deg": deg,
        "arcmin": arcmin,
        "arcsec": arcsec
    }
}

function testOrderComputation() {
    
    
    
    const pxTileWidth = 512
    const order = 3
    const computedPxAngSizeRadiant = Math.sqrt( 4 * Math.PI / (12 * (pxTileWidth * (2**order) )**2 ) )
    console.log(`Computing Pixel size with tile of ${pxTileWidth} pixels and order ${order}`)
    const rad2deg = 180 / Math.PI
    console.log ("Pixel size in radiant:" + computedPxAngSizeRadiant)
    console.log ("Pixel size in degrees:" + computedPxAngSizeRadiant * rad2deg)
    console.log ("Pixel size in arcmin:" + computedPxAngSizeRadiant * rad2deg * 60)


    const pxAngSizeDeg = 0.014314526715905858
    console.log(`Computing HiPS order having pixel angular size of ${pxAngSizeDeg} in degrees`)
    const deg2rad = Math.PI / 180
    const pxAngSizeRad = pxAngSizeDeg * deg2rad
    console.log(`pixel angular res in radians ${pxAngSizeRad}`)
    const computedOrder = 0.5 * Math.log2 ( Math.PI / (3 * pxAngSizeRad * pxAngSizeRad * pxTileWidth * pxTileWidth) )
    console.log(`Order ${computedOrder}`)
}


// from Mercator to HiPS
function testRefactoring(){
    const center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 170.015, 18.35);
    WCSLight.cutoutToHips(center, 0.06, 0.0005, "./wcslight/test/output/UC3/3_0/Mercator46.fits").then(res => {
        console.log(res)
    })
}

// from HiPS to Mercator
function testRefactoring2(){
    // https://alasky.cds.unistra.fr/DECaPS/DR1/g/
    // center = 287.566192 -0.66041762 GAL
    // center = 161.182571 -59.6974797 ICRSd
    // radius = 0.5
    // pxsize = 0.001
    const hipsUrl = "https://alasky.cds.unistra.fr/DECaPS/DR1/g/"
    const center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 161.182571, -59.6974797)
    const pxSize_deg = 0.001
    const radius_deg = 0.5
    let mercatorOutProj = new MercatorProjection()
    WCSLight.hipsCutout(center, radius_deg, pxSize_deg, hipsUrl, mercatorOutProj).then(res => {
        console.log(res)
    })
}

testRefactoring()
testRefactoring2()
// testNaNFits();
// testFits();
// testOrderComputation()
// computeOrder(0.005, 512)