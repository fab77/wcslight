import { FITSParsed } from "fitsparser/model/FITSParsed";
import { FITSParser } from "../../FITSParser-test-20220905/src/FITSParser-node";
// import { HiPSProjection } from "../src/projections/HiPSProjection";
import { MercatorProjection } from "../src/projections/MercatorProjection";

import { TestProj } from "../src/projections/TestProj"




describe("USE CASE 5: CutOut MER to HiPS:", function () {
    // it("USE CASE 5.0: CutOut MER -> HiPS with remote HiPS from pixel size", async () => {
    //     let in_mp = new MercatorProjection();
    //     const fits: FITSParsed = await in_mp.initFromFile('/mydir/MerSample.fits');
    //     if (fits) {
    //         let out_hp = new HiPSProjection();
    //         const in_pxsize = 0.001;
    //         const hipsBaseUrl = 'http://.....';
    //         out_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)

    //         let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
    //         const radius = 0.0001;
    //         const out_pxsize = 0.001;
    //         const cuoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_mp, out_hp);
    //         return cuoutResult;
    //     }
    // });

    // it("USE CASE 5.1: CutOut MER -> HiPS with remote HiPS from HiPS order", async () => {
    //     let in_mp = new MercatorProjection();
    //     const fits: FITSParsed = await in_mp.initFromFile('/mydir/MerSample.fits');

    //     if (fits) {
    //         let out_hp = new HiPSProjection();
    //         const order = 7;
    //         const hipsBaseUrl = 'http://.....';
    //         out_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order)

    //         let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
    //         const radius = 0.0001;
    //         const out_pxsize = 0.001;
    //         const cuoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_mp, out_hp);
    //         return cuoutResult;
    //     }
    // });


});





