import { FITSHeader, FITSWriter } from "jsfitsio";
import { FITSParsed } from "jsfitsio";
import { FITSParser } from "jsfitsio";
import { writeFITS } from "jsfitsio";
import { CoordsType } from "../src/model/CoordsType";
import { CutoutResult } from "../src/model/CutoutResult";
import { NumberType } from "../src/model/NumberType";
import { Point } from "../src/model/Point";
import { HiPSProjection } from "../src/projections/HiPSProjection";
import { MercatorProjection } from "../src/projections/MercatorProjection";

import WCSLight from "../src/WCSLight";




console.log("USE CASE 3: CutOut HiPS to MER:");
console.log("USE CASE 3.0: cutout with remote HiPS from pixel size");
let in_hp = new HiPSProjection();
let in_pxsize = 0.001;
let hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)
let out_mp = new MercatorProjection();
let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
let radius = 0.05;
let out_pxsize = 0.0005;
let cutoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp);
let firstHeader = cutoutResult.fitsheader[0];
let firstData = cutoutResult.fitsdata.get(0);
if (firstData !== undefined) {
    let fw = new FITSWriter();
    fw.run(firstHeader, firstData)
    writeFITS("./test/output/UC3/3_0/Mercator.fits", fw._fitsData);
} else{
    // TODO failed
}
// return cutoutResult;


console.log("###################### ###################### ######################");
console.log("USE CASE 3.1: cutout with local HiPS from pixel size")
in_hp = new HiPSProjection();
in_pxsize = 0.001;
hipsBaseUrl = '/local-hips-basedir/';
in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)
out_mp = new MercatorProjection();
centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
radius = 0.0001;
out_pxsize = 0.001;
cutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp);
// return cuoutResult;


console.log("###################### ###################### ######################");
console.log("USE CASE 3.2: cutout with remote HiPS from HiPS order")
in_hp = new HiPSProjection();
let order = 8;
hipsBaseUrl = 'http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/';
in_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order)
out_mp = new MercatorProjection();
centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
radius = 0.05;
out_pxsize = 0.0005;
cutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp);
let data = cutoutResult.fitsdata.get(0);
let header = cutoutResult.fitsheader[0];
if (data !== undefined) {
    const fw = new FITSWriter();
    fw.run(header, data);
    writeFITS("./test/output/UC3/3_2/Mercator.fits", fw._fitsData);
} else{
    // TODO failed
}
// return cutoutResult;


console.log("###################### ###################### ######################");
console.log("USE CASE 3.3: cutout with local HiPS from HiPS order")
in_hp = new HiPSProjection();
order = 7;
hipsBaseUrl = '/local-hips-basedir/';
in_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order)
out_mp = new MercatorProjection();
centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
radius = 0.0001;
out_pxsize = 0.001;
cutoutResult = await WCSLight.cutout(centre, radius, out_pxsize, in_hp, out_mp);
// return cuoutResult;





