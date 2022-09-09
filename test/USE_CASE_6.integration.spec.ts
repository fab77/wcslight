import { FITSParsed } from "../../FITSParser-test-20220905/src/model/FITSParsed";
import { FITSParser } from "../../FITSParser-test-20220905/src/FITSParser-node";
import { CoordsType } from "../src/model/CoordsType";
import { CutoutResult } from "../src/model/CutoutResult";
import { NumberType } from "../src/model/NumberType";
import {Point} from "../src/model/Point";
import { MercatorProjection } from "../src/projections/MercatorProjection";

import {WCSLight} from "../src/WCSLight";




describe("USE CASE 6: CutOut MER to MER:", function () {
    it("", async () => {
        let in_mp = new MercatorProjection();
        const fits: FITSParsed = await in_mp.initFromFile('./test/input/Mercator.fits');

        if (fits) {
            let out_mp = new MercatorProjection();

            let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 12.35, 50.744);
            const radius = 0.02;
            const out_pxsize = 0.001;
            const cuoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_mp, out_mp);
            let data = cuoutResult.fitsdata.get(0);
            FITSParser.writeFITS(cuoutResult.fitsheader[0], data as Uint8Array[], "./test/output/UC6_0_Mercator.fits");
            return cuoutResult;
        }
    });


});





