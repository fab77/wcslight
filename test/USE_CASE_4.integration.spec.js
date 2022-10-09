import { FITSWriter } from "jsfitsio";
import { CoordsType } from "../lib-esm/model/CoordsType.js";
import { NumberType } from "../lib-esm/model/NumberType.js";
import { Point } from "../lib-esm/model/Point.js";
import { HiPSProjection } from "../lib-esm/projections/HiPSProjection.js";
import { WCSLight } from '../lib-esm/WCSLight.js';

import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// THIS USE CASE IS NOT WORKING. there is a bug somewhere that prevent to generate 
// same tiles as the ones taken in input.
function test01() {

    console.log("USE CASE 4: CutOut HiPS to HiPS:");
    console.log("USE CASE 4.0: cutout with remote HiPS from pixel size")
    const in_hp = new HiPSProjection();
    const in_pxsize = 0.001;
    const hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
    in_hp.parsePropertiesFile(hipsBaseUrl).then(propFileIn => {

        in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)


        const out_hp = new HiPSProjection();
        const out_pxsize = 0.001;
        out_hp.parsePropertiesFile(hipsBaseUrl).then(propFile => {
            out_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, out_pxsize)
            const centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
            const radius = 0.1;
            WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_hp).then(cutoutResult => {
                for (let fh of cutoutResult.fitsheader) {
                    const tileno = fh.get("NPIX");
                    // let fhidx = cutoutResult.fitsheader.indexOf(fh);
                    const data = cutoutResult.fitsdata.get(tileno);
                    if (data !== undefined) {
                        const destDir = __dirname + "/output/UC4/4_0/Npix" + tileno + ".fits";
                        const fw = new FITSWriter();
                        fw.run(fh, data);
                        fs.writeFile(destDir, fw._fitsData);
                        console.log(`File written in ${destDir}`);
                    } else {
                        // TODO test failed
                    }
                }
            });
        });

    });
    // return cutoutResult;
}

function test02() {

    console.log("###################### ###################### ######################");
    console.log("USE CASE 4.1: cutout with remote HiPS from HiPS order")
    const in_hp = new HiPSProjection();
    const order = 6;
    const hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
    in_hp.parsePropertiesFile(hipsBaseUrl).then(propFile => {
        in_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order);
        const out_hp = new HiPSProjection();
        const out_pxsize = 0.001;
        out_hp.parsePropertiesFile(hipsBaseUrl).then(p => {

            out_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, out_pxsize)
            const centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
            const radius = 0.05;
            WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_hp).then(cutoutResult => {
                if (cutoutResult.fitsheader.length == 0) {
                    console.log("no representative data found")
                }
                for (let fh of cutoutResult.fitsheader) {
                    const tileno = fh.get("NPIX");
                    const data = cutoutResult.fitsdata.get(tileno);
                    if (data !== undefined) {
                        const fw = new FITSWriter();
                        const destDir = __dirname + "/output/UC4/4_1/Npix" + tileno + ".fits";
                        fw.run(fh, data);
                        fs.writeFile(destDir, fw._fitsData);
                        console.log(`File written in ${destDir}`);
                    } else {
                        // TODO test failed
                    }

                }
            });
        })

    });
}


function test03() {

    console.log("###################### ###################### ######################");
    console.log("USE CASE 4.2: cutout with remote HiPS from HiPS order")
    const in_hp = new HiPSProjection();
    const order = 6;
    const hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
    in_hp.parsePropertiesFile(hipsBaseUrl).then(propFile => {
        in_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order);
        const out_hp = new HiPSProjection();
        const out_pxsize = 1.0;
        out_hp.parsePropertiesFile(hipsBaseUrl).then(p => {

            out_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order)
            const centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
            const radius = 0.05;
            WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_hp).then(cutoutResult => {
                if (cutoutResult.fitsheader.length == 0) {
                    console.log("no representative data found")
                }
                for (let fh of cutoutResult.fitsheader) {
                    const tileno = fh.get("NPIX");
                    const data = cutoutResult.fitsdata.get(tileno);
                    if (data !== undefined) {
                        const fw = new FITSWriter();
                        const destDir = __dirname + "/output/UC4/4_2/Npix" + tileno + ".fits";
                        fw.run(fh, data);
                        fs.writeFile(destDir, fw._fitsData);
                        console.log(`File written in ${destDir}`);
                    } else {
                        // TODO test failed
                    }

                }
            });
        })

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
console.log("Running test 2/4 of USE CASE 2")
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
test03();

