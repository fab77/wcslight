import { FITSParsed } from "fitsparser/model/FITSParsed";
import { FITSParser } from "../../FITSParser-test-20220905/src/FITSParser-node";
// import { HiPSProjection } from "../src/projections/HiPSProjection";
import { MercatorProjection } from "../src/projections/MercatorProjection";

import { TestProj } from "../src/projections/TestProj"




describe("USE CASE 3: CutOut HiPS to MER:", function () {
    // it("USE CASE 3.0: cutout with remote HiPS from pixel size", async () => {
    //     let in_hp = new HiPSProjection();
    //     const in_pxsize = 0.001;
    //     const hipsBaseUrl = 'http://.....';
    //     in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)

    //     let out_mp = new MercatorProjection();

    //     let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
    //     const radius = 0.0001;
    //     const out_pxsize = 0.001;

    //     const cuoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp);
    //     return cuoutResult;
    // });

    // it("USE CASE 3.1: cutout with local HiPS from pixel size", async () => {
    //     let in_hp = new HiPSProjection();
    //     const in_pxsize = 0.001;
    //     const hipsBaseUrl = '/local-hips-basedir/';
    //     in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)

    //     let out_mp = new MercatorProjection();

    //     let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
    //     const radius = 0.0001;
    //     const out_pxsize = 0.001;

    //     const cuoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp);
    //     return cuoutResult;
    // });

    // it("USE CASE 3.2: cutout with remote HiPS from HiPS order", async () => {
    //     let in_hp = new HiPSProjection();
    //     const order = 7;
    //     const hipsBaseUrl = 'http://.....';
    //     in_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order)

    //     let out_mp = new MercatorProjection();

    //     let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
    //     const radius = 0.0001;
    //     const out_pxsize = 0.001;

    //     const cuoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp);
    //     return cuoutResult;
    // });

    // it("USE CASE 3.3: cutout with local HiPS from HiPS order", async () => {
    //     let in_hp = new HiPSProjection();
    //     const order = 7;
    //     const hipsBaseUrl = '/local-hips-basedir/';
    //     in_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order)

    //     let out_mp = new MercatorProjection();

    //     let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
    //     const radius = 0.0001;
    //     const out_pxsize = 0.001;

    //     const cuoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp);
    //     return cuoutResult;
    // });


});





