import { FITSParser, FITSParsed, FITSWriter, writeFITS } from "jsfitsio";
import { CoordsType } from "../src/model/CoordsType";
import { CutoutResult } from "../src/model/CutoutResult";
import { NumberType } from "../src/model/NumberType";
import { Point } from "../src/model/Point";
import { HiPSProjection } from "../src/projections/HiPSProjection";
import { MercatorProjection } from "../src/projections/MercatorProjection";
import WCSLight from "../src/WCSLight";




console.log("USE CASE 5: CutOut MER to HiPS:");
console.log("USE CASE 5.0: CutOut MER -> HiPS with remote HiPS from pixel size");
let in_mp = new MercatorProjection();
let fits: FITSParsed = await in_mp.initFromFile('./test/input/Mercator.fits');
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
            const fw = new FITSWriter();
            fw.run(fh, data);
            writeFITS("./test/output/UC5/5_0/Npix"+tileno+".fits", fw._fitsData);
        } else {
            // TODO test failed
        }
        
    }
    // return cutoutResult;
}
 
console.log("###################### ###################### ######################");
console.log("USE CASE 5.1: CutOut MER -> HiPS with remote HiPS from HiPS order");
in_mp = new MercatorProjection();
fits = await in_mp.initFromFile('./test/input/Mercator.fits');
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
            const fw = new FITSWriter();
            fw.run(fh, data);
            writeFITS("./test/output/UC5/5_1/Npix"+tileno+".fits", fw._fitsData);
        } else {
            // TODO test failed
        }
        
    }
    // return cutoutResult;
}





