import { FITSWriter } from "jsfitsio";
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


    console.log("USE CASE 5: CutOut MER to HiPS:");
    console.log("USE CASE 5.0: CutOut MER -> HiPS with remote HiPS from pixel size");
    let in_mp = new MercatorProjection();
    in_mp.initFromFile('./test/input/Mercator.fits').then(fits => {

        if (fits) {
            const out_hp = new HiPSProjection();
            const pxsize = 0.001;
            const hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
            out_hp.parsePropertiesFile(hipsBaseUrl).then(p => {
                out_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, pxsize)

                const centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 12.350388900000123, 50.74485150000047);
                const radius = 0.05;

                WCSLight.cutout(centre, radius, pxsize, in_mp, out_hp).then(cutoutResult => {

                    for (let fh of cutoutResult.fitsheader) {
                        const tileno = fh.get("NPIX");
                        const data = cutoutResult.fitsdata.get(tileno);
                        if (data !== undefined) {
                            const destDir = __dirname + "/output/UC5/5_0/Npix" + tileno + ".fits";
                            const fw = new FITSWriter();
                            fw.run(fh, data);
                            fs.writeFile(destDir, fw._fitsData);
                            console.log(`File written in ${destDir}`);
                            // writeFITS("./test/output/UC5/5_0/Npix" + tileno + ".fits", fw._fitsData);
                        } else {
                            // TODO test failed
                        }

                    }
                });

            })

        }
    });
}

function test02() {


    console.log("###################### ###################### ######################");
    console.log("USE CASE 5.1: CutOut MER -> HiPS with remote HiPS from HiPS order");
    const in_mp = new MercatorProjection();
    in_mp.initFromFile('./test/input/Mercator.fits').then(fits => {


        if (fits) {
            const out_hp = new HiPSProjection();
            const order = 8;
            const hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
            out_hp.parsePropertiesFile(hipsBaseUrl).then(p => {


                out_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order);

                const centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 12.350388900000123, 50.74485150000047);
                const radius = 0.05;

                const pxsize = 0.002; // shouldn't be computed from the order?
                WCSLight.cutout(centre, radius, pxsize, in_mp, out_hp).then(cutoutResult => {


                    for (let fh of cutoutResult.fitsheader) {
                        const tileno = fh.get("NPIX");
                        const data = cutoutResult.fitsdata.get(tileno);
                        if (data !== undefined) {
                            const destDir = __dirname + "/output/UC5/5_1/Npix" + tileno + ".fits";
                            const fw = new FITSWriter();
                            fw.run(fh, data);
                            fs.writeFile(destDir, fw._fitsData);
                            // writeFITS("./test/output/UC5/5_1/Npix" + tileno + ".fits", fw._fitsData);
                        } else {
                            // TODO test failed
                        }

                    }
                });
            });
            // return cutoutResult;
        }
    });
}




console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
console.log("Running test 1/2 of USE CASE 5")
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
test01();
console.log("@")
console.log("@")
console.log("@")
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
console.log("Running test 2/2 of USE CASE 5")
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
test02();