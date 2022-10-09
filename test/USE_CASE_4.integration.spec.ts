import { FITSWriter, writeFITS } from "jsfitsio";
import { CoordsType } from "../src/model/CoordsType";
import { CutoutResult } from "../src/model/CutoutResult";
import { NumberType } from "../src/model/NumberType";
import { Point } from "../src/model/Point";
import { HiPSProjection } from "../src/projections/HiPSProjection";
import WCSLight from "../src/WCSLight";





console.log("USE CASE 4: CutOut HiPS to HiPS:");
console.log("USE CASE 4.0: cutout with remote HiPS from pixel size")
let in_hp = new HiPSProjection();
const in_pxsize = 0.001;
let hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)
let out_hp = new HiPSProjection();
let out_pxsize = 0.002;
out_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, out_pxsize)
let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
let radius = 0.05;
let cutoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_hp);
for (let fh of cutoutResult.fitsheader) {
    let tileno = fh.get("NPIX");
    // let fhidx = cutoutResult.fitsheader.indexOf(fh);
    let data = cutoutResult.fitsdata.get(tileno);
    if (data !== undefined) {
        const fw = new FITSWriter();
        fw.run(fh, data);
        writeFITS("./test/output/UC4/4_0/Npix"+tileno+".fits", fw._fitsData);
    } else {
        // TODO test failed
    }
}
// return cutoutResult;

console.log("###################### ###################### ######################");
console.log("USE CASE 4.1: cutout with remote HiPS from HiPS order")
in_hp = new HiPSProjection();
const order = 6;
hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
in_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order);
out_hp = new HiPSProjection();
out_pxsize = 0.001;
out_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, out_pxsize)
centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
radius = 0.05;
cutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_hp);
if (cutoutResult.fitsheader.length == 0) {
    console.log("no representative data found")
}
for (let fh of cutoutResult.fitsheader) {
    let tileno = fh.get("NPIX");
    let data = cutoutResult.fitsdata.get(tileno);
    if (data !== undefined) {
        const fw = new FITSWriter();
        fw.run(fh, data);
        writeFITS("./test/output/UC4/4_1/Npix"+tileno+".fits", fw._fitsData);
    } else {
        // TODO test failed
    }
    
}
// return cutoutResult;





