import { FITSHeader } from "fitsparser/model/FITSHeader";
import { FITSParsed } from "fitsparser/model/FITSParsed";
import { FITSParser } from "../../FITSParser/src/FITSParser-node";
import { CoordsType } from "../src/model/CoordsType";
import { CutoutResult } from "../src/model/CutoutResult";
import { NumberType } from "../src/model/NumberType";
import { Point } from "../src/model/Point";
import { HiPSProjection } from "../src/projections/HiPSProjection";
import { MercatorProjection } from "../src/projections/MercatorProjection";

import WCSLight from "../src/WCSLight";




describe("USE CASE 3: CutOut HiPS to MER:", function () {
    it("USE CASE 3.0: cutout with remote HiPS from pixel size", async () => {
        let in_hp = new HiPSProjection();
        const in_pxsize = 0.001;
        const hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
        in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)

        let out_mp = new MercatorProjection();

        let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
        const radius = 0.05;
        const out_pxsize = 0.0005;

        const cutoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp);

        let data = cutoutResult.fitsdata.get(0);
        if (data !== undefined) {
            FITSParser.writeFITS(cutoutResult.fitsheader[0], data, "./test/output/UC3/3_0/Mercator.fits");
        } else{
            // TODO failed
        }
        return cutoutResult;
    });

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

    it("USE CASE 3.2: cutout with remote HiPS from HiPS order", async () => {
        let in_hp = new HiPSProjection();
        const order = 8;
        const hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
        in_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order)

        let out_mp = new MercatorProjection();

        let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
        const radius = 0.05;
        const out_pxsize = 0.0005;

        const cutoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp);
        let data = cutoutResult.fitsdata.get(0);
        if (data !== undefined) {
            FITSParser.writeFITS(cutoutResult.fitsheader[0], data, "./test/output/UC3/3_2/Mercator.fits");
        } else{
            // TODO failed
        }
        return cutoutResult;
    });

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





