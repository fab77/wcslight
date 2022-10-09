import { FITSParsed } from "fitsparser/model/FITSParsed";
import { CoordsType } from "./src/model/CoordsType";
import { CutoutResult } from "./src/model/CutoutResult";
import { NumberType } from "./src/model/NumberType";
import Point from "./src/model/Point";
import HiPSProjection from "./src/projections/HiPSProjection";
import MercatorProjection from "./src/projections/MercatorProjection";
import WCSLight from "./src/WCSLight";

// ##################################
// USE CASE 1: Single File Processing
// ##################################
usecase1_0();
// USE CASE 1.0: retrieve pixel's values from FITS file in HiPS projection (single file: remote)
function usecase1_0() {
    let hp = new HiPSProjection();
    let myfits: FITSParsed;
    let physicalValues: number[][];
    hp.initFromFile("http://skies.esac.esa.int/Herschel/normalized/PACS_hips160//Norder8/Dir40000/Npix47180.fits")
        .then( (fits) => {
            myfits = fits;
            physicalValues = hp.extractPhysicalValues(fits);
        });    
}

// USE CASE 1.1: retrieve pixel's values from FITS file in HiPS projection (single file: local)
function usecase1_1() {
    let hp = new HiPSProjection();
    let myfits: FITSParsed;
    let physicalValues: number[][];
    hp.initFromFile('./test/input/Npix42.fits')
        .then( (fits) => {
            myfits = fits;
            physicalValues = hp.extractPhysicalValues(fits);
        });
}


// USE CASE 1.2: retrieve pixel's values from FITS file in Mercator projection (single file: local)
function usecase1_2(){
    let mp = new MercatorProjection();
    let myfits: FITSParsed;
    let physicalValues: number[][];
    mp.initFromFile('/mydir/MerSample.fits')
        .then( (fits) => {
            myfits = fits;
            physicalValues = mp.extractPhysicalValues(fits);
        });
}

// ###############################################
// USE CASE 2: Retrieve HiPS Files by HiPS baseURL
// ###############################################
// USE CASE 2.0: Retrieve HiPS Files by remote baseURL and pxsize
async function usecase2_0(){
    let hp = new HiPSProjection();
    let pxsize = 0.001; // degrees
    hp.initFromHiPSLocationAndPxSize('http://<hips-server>/<hips-base-dir>/', pxsize);
    let center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 20.43, 19.23);
    let radiusDeg = 0.0005;
    let raDecList: number[][] = hp.getImageRADecList(center, radiusDeg);

    const inputPixelsList = hp.world2pix(raDecList);
    const destDir = '/myLocalDestinationPath/';
    await hp.getFITSFiles(inputPixelsList, destDir)
    console.log("Files stored in "+ destDir);
}


// USE CASE 2.1: Retrieve HiPS Files by local baseURL and pxsize
async function usecase2_1(){
    let hp = new HiPSProjection();
    let pxsize = 0.001; // degrees
    hp.initFromHiPSLocationAndPxSize('/local-hips-basedir/', pxsize);
    let center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 20.43, 19.23);
    let radiusDeg = 0.0005;
    let raDecList: number[][] = hp.getImageRADecList(center, radiusDeg);

    const inputPixelsList = hp.world2pix(raDecList);
    const destDir = '/myLocalDestinationPath/';
    await hp.getFITSFiles(inputPixelsList, destDir)
    console.log("Files stored in "+ destDir);
}


// USE CASE 2.2: Retrieve HiPS Files by remote baseURL and order
async function usecase2_2(){
    
    let hp = new HiPSProjection();
    let order = 7; // degrees
    hp.initFromHiPSLocationAndOrder('http://<hips-server>/<hips-base-dir>/', order);
    let center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 20.43, 19.23);
    let radiusDeg = 0.0005;
    let raDecList: number[][] = hp.getImageRADecList(center, radiusDeg);

    const inputPixelsList = hp.world2pix(raDecList);
    const destDir = '/myLocalDestinationPath/';
    await hp.getFITSFiles(inputPixelsList, destDir)
    console.log("Files stored in "+ destDir);
        
}


// USE CASE 2.3: Retrieve HiPS Files by local baseURL and order
async function usecase2_3(){
    let hp = new HiPSProjection();
    let order = 7; // degrees
    hp.initFromHiPSLocationAndOrder('/local-hips-basedir/', order);
    let center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 20.43, 19.23);
    let radiusDeg = 0.0005;
    let raDecList: number[][] = hp.getImageRADecList(center, radiusDeg);

    const inputPixelsList = hp.world2pix(raDecList);
    const destDir = '/myLocalDestinationPath/';
    await hp.getFITSFiles(inputPixelsList, destDir)
    console.log("Files stored in "+ destDir);
}

// ##################################
// USE CASE 3: CutOut HiPS to MER
// ##################################
// USE CASE 3.0: cutout with remote HiPS from pixel size
async function usecase3_0() {
    let in_hp = new HiPSProjection();
    const in_pxsize = 0.001;
    const hipsBaseUrl = 'http://.....';
    in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)

    let out_mp = new MercatorProjection();

    let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
    const radius = 0.0001;
    const out_pxsize = 0.001;
    
    const cuoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize,in_hp, out_mp);
    return cuoutResult;
}

// USE CASE 3.1: cutout with local HiPS from pixel size
async function usecase3_1() {
    let in_hp = new HiPSProjection();
    const in_pxsize = 0.001;
    const hipsBaseUrl = '/local-hips-basedir/';
    in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)

    let out_mp = new MercatorProjection();

    let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
    const radius = 0.0001;
    const out_pxsize = 0.001;
    
    const cuoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize,in_hp, out_mp);
    return cuoutResult;
}

// USE CASE 3.2: cutout with remote HiPS from HiPS order
async function usecase3_2() {
    let in_hp = new HiPSProjection();
    const order = 7;
    const hipsBaseUrl = 'http://.....';
    in_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order)

    let out_mp = new MercatorProjection();

    let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
    const radius = 0.0001;
    const out_pxsize = 0.001;
    
    const cuoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize,in_hp, out_mp);
    return cuoutResult;
}

// USE CASE 3.3: cutout with local HiPS from HiPS order
async function usecase3_3() {
    let in_hp = new HiPSProjection();
    const order = 7;
    const hipsBaseUrl = '/local-hips-basedir/';
    in_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order)

    let out_mp = new MercatorProjection();

    let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
    const radius = 0.0001;
    const out_pxsize = 0.001;
    
    const cuoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize,in_hp, out_mp);
    return cuoutResult;
}

// ##################################
// USE CASE 4: CutOut HiPS to HiPS
// ##################################
// USE CASE 4.0: cutout with remote HiPS from pixel size
async function usecase4_0() {
    let in_hp = new HiPSProjection();
    const in_pxsize = 0.001;
    const hipsBaseUrl = 'http://.....';
    in_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)

    let out_hp = new HiPSProjection();
    let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
    const radius = 0.0001;
    const out_pxsize = 0.001;
    
    const cuoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize,in_hp, out_hp);
    return cuoutResult;
}
// USE CASE 4.1: cutout with remote HiPS from HiPS order
async function usecase4_1() {
    let in_hp = new HiPSProjection();
    const order = 7;
    const hipsBaseUrl = 'http://.....';
    in_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order);

    let out_mp = new MercatorProjection();

    let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
    const radius = 0.0001;
    const out_pxsize = 0.001;
    
    const cuoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize,in_hp, out_mp);
    return cuoutResult;
}

// ##################################
// USE CASE 5: CutOut MER to HiPS
// ##################################
// USE CASE 5.0: CutOut MER -> HiPS with remote HiPS from pixel size
async function usecase5_0() {
    let in_mp = new MercatorProjection();
    const fits: FITSParsed = await in_mp.initFromFile('/mydir/MerSample.fits');
    if (fits) {
        let out_hp = new HiPSProjection();
        const in_pxsize = 0.001;
        const hipsBaseUrl = 'http://.....';
        out_hp.initFromHiPSLocationAndPxSize(hipsBaseUrl, in_pxsize)
    
        let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
        const radius = 0.0001;
        const out_pxsize = 0.001;
        const cuoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize,in_mp, out_hp);
        return cuoutResult;
    }
}
// USE CASE 5.1: CutOut MER -> HiPS with remote HiPS from HiPS order
async function usecase5_1() {
    let in_mp = new MercatorProjection();
    const fits: FITSParsed = await in_mp.initFromFile('/mydir/MerSample.fits');
    
    if (fits) {
        let out_hp = new HiPSProjection();
        const order = 7;
        const hipsBaseUrl = 'http://.....';
        out_hp.initFromHiPSLocationAndOrder(hipsBaseUrl, order)

        let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
        const radius = 0.0001;
        const out_pxsize = 0.001;
        const cuoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize,in_mp, out_hp);
        return cuoutResult;
    }

}


// ##################################
// USE CASE 6: CutOut MER to MER
// ##################################
// USE CASE 5.0: CutOut MER -> MER 
async function usecase6_0() {
    let in_mp = new MercatorProjection();
    const fits: FITSParsed = await in_mp.initFromFile('/mydir/MerSample.fits');
    
    if (fits) {
        let out_mp = new MercatorProjection();
    
        let centre = new Point(CoordsType.ASTRO, NumberType.DEGREES, 22.19, 47.31);
        const radius = 0.0001;
        const out_pxsize = 0.001;
        const cuoutResult: CutoutResult = await WCSLight.cutout(centre, radius, out_pxsize,in_mp, out_mp);
        return cuoutResult;
    }
}