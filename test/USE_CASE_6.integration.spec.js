import { FITSWriter } from "jsfitsio";
import { CoordsType } from "../lib-esm/model/CoordsType.js";
import { NumberType } from "../lib-esm/model/NumberType.js";
import { Point } from "../lib-esm/model/Point.js";
import { MercatorProjection } from "../lib-esm/projections/MercatorProjection.js";
import { WCSLight } from '../lib-esm/WCSLight.js';

import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


function test01() {


    console.log("USE CASE 6: CutOut MER to MER:");
    console.log("")
    let in_mp = new MercatorProjection();
    in_mp.initFromFile('./test/input/Mercator.fits').then(fits => {
        if (fits) {
            let out_mp = new MercatorProjection();

            let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 12.35, 50.744);
            const radius = 0.02;
            const out_pxsize = 0.001;
            WCSLight.cutout(centre, radius, out_pxsize, in_mp, out_mp).then(cuoutResult => {


                let data = cuoutResult.fitsdata.get(0);
                let header = cuoutResult.fitsheader[0];

                let destDir = __dirname + '/output/UC6/UC6_0_Mercator.fits';
                const fw = new FITSWriter();
                fw.run(header, data);
                fs.writeFile(destDir, fw._fitsData);
                console.log(`File written in ${destDir}`);
                // writeFITS("./test/output/UC6/UC6_0_Mercator.fits", fw._fitsData);

            })
        }
    })
}




console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
console.log("Running test 1/1 of USE CASE 6")
console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
test01();

