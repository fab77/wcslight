import { FITSParsed } from "fitsparser/model/FITSParsed";
import { FITSParser } from "../../FITSParser/src/FITSParser-node";
import { CoordsType } from "../src/model/CoordsType";
import { CutoutResult } from "../src/model/CutoutResult";
import { NumberType } from "../src/model/NumberType";
import { Point } from "../src/model/Point";
import { HiPSProjection } from "../src/projections/HiPSProjection";
import { MercatorProjection } from "../src/projections/MercatorProjection";
import WCSLight from "../src/WCSLight";





describe("USE CASE 4: CutOut HiPS to HiPS:", function () {
    it("USE CASE 4.0: cutout with remote HiPS from pixel size", async () => {
        let in_hp = new HiPSProjection();
        const in_pxsize = 0.001;
        const hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
        in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)

        let out_hp = new HiPSProjection();
        const out_pxsize = 0.002;
        out_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, out_pxsize)

        let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
        const radius = 0.05;

        const cutoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_hp);
        for (let fh of cutoutResult.fitsheader) {
            let tileno = fh.get("NPIX");
            // let fhidx = cutoutResult.fitsheader.indexOf(fh);
            let data = cutoutResult.fitsdata.get(tileno);
            if (data !== undefined) {
                FITSParser.writeFITS(cutoutResult.fitsheader[0], data, "./test/output/UC4/4_0/Npix"+tileno+".fits");
            } else {
                // TODO test failed
            }
            
        }
        return cutoutResult;
    });

    it("USE CASE 4.1: cutout with remote HiPS from HiPS order", async () => {
        let in_hp = new HiPSProjection();
        const order = 6;
        const hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
        in_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order);

        let out_hp = new HiPSProjection();
        const out_pxsize = 0.001;
        out_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, out_pxsize)

        let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
        const radius = 0.05;
        

        const cutoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_hp);
        if (cutoutResult.fitsheader.length == 0) {
            return null;
        }
        for (let fh of cutoutResult.fitsheader) {
            
            let tileno = fh.get("NPIX");
            let data = cutoutResult.fitsdata.get(tileno);
            if (data !== undefined) {
                FITSParser.writeFITS(cutoutResult.fitsheader[0], data, "./test/output/UC4/4_1/Npix"+tileno+".fits");
            } else {
                // TODO test failed
            }
            
        }
        return cutoutResult;
    });


});





