import { FITSParsed } from "../../FITSParser/src/model/FITSParsed";
import { FITSParser } from "../../FITSParser/src/FITSParser-node";
import { CoordsType } from "../src/model/CoordsType";
import { CutoutResult } from "../src/model/CutoutResult";
import { NumberType } from "../src/model/NumberType";
import { Point } from "../src/model/Point";
import { HiPSProjection } from "../src/projections/HiPSProjection";
import { MercatorProjection } from "../src/projections/MercatorProjection";

import WCSLight from "../src/WCSLight";




describe("USE CASE 5: CutOut MER to HiPS:", function () {
    it("USE CASE 5.0: CutOut MER -> HiPS with remote HiPS from pixel size", async () => {
        let in_mp = new MercatorProjection();
        const fits: FITSParsed = await in_mp.initFromFile('./test/input/Mercator.fits');
        if (fits) {
            let out_hp = new HiPSProjection();
            const pxsize = 0.001;
            const hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
            out_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, pxsize)

            let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 12.350388900000123, 50.74485150000047);
            const radius = 0.05;
            
            const cutoutResult: CutoutResult = await WCSLight.cutout(centre, radius, pxsize, in_mp, out_hp);
            for (let fh of cutoutResult.fitsheader) {
                let tileno = fh.get("NPIX");
                let data = cutoutResult.fitsdata.get(tileno);
                if (data !== undefined) {
                    FITSParser.writeFITS(cutoutResult.fitsheader[0], data, "./test/output/UC5/5_0/Npix"+tileno+".fits");
                } else {
                    // TODO test failed
                }
                
            }
            return cutoutResult;
        }
    });

    it("USE CASE 5.1: CutOut MER -> HiPS with remote HiPS from HiPS order", async () => {
        let in_mp = new MercatorProjection();
        const fits: FITSParsed = await in_mp.initFromFile('./test/input/Mercator.fits');

        if (fits) {
            let out_hp = new HiPSProjection();
            const order = 8;
            const hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
            out_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order);

            let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 12.350388900000123, 50.74485150000047);
            const radius = 0.05;

            const pxsize = 0.002; // shouldn't be computed from the order?
            const cutoutResult: CutoutResult = await WCSLight.cutout(centre, radius, pxsize, in_mp, out_hp);
            for (let fh of cutoutResult.fitsheader) {
                let tileno = fh.get("NPIX");
                let data = cutoutResult.fitsdata.get(tileno);
                if (data !== undefined) {
                    FITSParser.writeFITS(cutoutResult.fitsheader[0], data, "./test/output/UC5/5_1/Npix"+tileno+".fits");
                } else {
                    // TODO test failed
                }
                
            }
            return cutoutResult;
        }
    });


});





