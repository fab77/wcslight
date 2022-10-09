import HiPSProjection from "./projections/HiPSProjection";
import MercatorProjection from "./projections/MercatorProjection";
import WCSLight from "./WCSLight";



/* **************** */
/* **************** */
/** Canvas use case */
/** From HiPS file  */
/* **************** */
/* **************** */
let fileuri = "<path_file_to_fits>.fits";
let inproj = new HiPSProjection([fileuri]);
inproj.computePixValues();
let canvaslist = inproj.getCanvas2d("linear", "grayscale", false); // projection type can be taken directly from the FITS
let canvas = canvaslist.get(0);
canvas.process(); // imgsrc is the jpg/png
canvas.setMinMax(min, max);
canvas.setTfunction(tfunction);
canvas.setColorMap(colorMap);
let imgsrc2 = canvas.process(); // imgsrc is the jpg/png
canvas.reset();
/** END Canvas use case */


/* **************** */
/* **************** */
/** Canvas use case */
/** From MER  file  */
/* **************** */
/* **************** */
let fileuri = "<path_file_to_fits>.fits";
let inproj = new MercatorProjection([fileuri]);
inproj.computePixValues();
let canvaslist = inproj.getCanvas2d("linear", "grayscale", false); // projection type can be taken directly from the FITS
let canvas = canvaslist.get(0);
canvas.process(); // imgsrc is the jpg/png
let imgsrc1 = canvas.getCanvas2DBrowse();
canvas.setMinMax(min, max);
canvas.setTfunction(tfunction);
canvas.setColorMap(colorMap);
canvas.process();
let imgsrc2 = canvas.getCanvas2DBrowse(); // imgsrc is the jpg/png
canvas.reset();
/** END Canvas use case */



/* *************************** */
/* *************************** */
/** Change projection use case */
/* *************************** */
/* *************************** */
// TODO TODO TODO TODO TODO TODO 
// TODO TODO TODO TODO TODO TODO 
// TODO TODO TODO TODO TODO TODO 
// TODO TODO TODO TODO TODO TODO 
// TODO TODO TODO TODO TODO TODO 


/* ****************   */
/* ****************   */
/* CUTOUT Use Case 1  */
/* HiPS URI as input  */
/* HiPS to MER        */
/* ****************   */
let center = {"ra": 21, "dec": 19};
let radius = 0.001;
let pxsize = 0.0005;

let hipsBaseUri = "http://<base hips URL> or <base file system dir";
let inproj = new HiPSProjection(null, hipsBaseUri, pxsize);

let outproj = new MercatorProjection();

let cutoutFiles = WCSLight.cutout(center, radius, pxsize, inproj, outproj);

for (cf of cutoutFiles) {

    let fitsheader = cf.fitsheader;
    let fitsdata = cf.fitsdata;
    let canvas2dlist = cf.canvas2dlist;
    let encodedData = WCSLight.writeFITS(fitsheader, fitsdata);
    
}

/** END CUTOUT use case */


/* ****************   */
/* ****************   */
/* CUTOUT Use Case 2  */
/* file list as input */
/* HiPS to MER        */
/* ****************   */
// TO CHECK: in this case I need FITSParser to return header {order, naxis[1-2], npix, bscale, bzero, blank}
// TO CHECK: FITSParser must return data as pixel values and not physical values
// TO CHECK: FITSParser must return data as a matrix naxis2 x naxis1
let center = {"ra": 21, "dec": 19};
let radius = 0.001;
let pxsize = 0.0005;

let filelist = ["myfolder/file1.fits", "myfolder/file2.fits", "myfolder/file3.fits" ];
// to be reviewed. pass only the local basepath and compute tilenos using center, radius and norder or (pxsize, naxis)
let inproj = new HiPSProjection(filelist);

let outproj = new MercatorProjection();

let cutoutFiles = WCSLight.cutout(center, radius, pxsize, inproj, outproj);

for (cf of cutoutFiles) {

    let fitsheader = cf.fitsheader;
    let fitsdata = cf.fitsdata;
    let canvas2dlist = cf.canvas2dlist;
    let encodedData = WCSLight.writeFITS(fitsheader, fitsdata);
    
}
/** END CUTOUT use case */


/* ****************   */
/* ****************   */
/* CUTOUT Use Case 3  */
/* file list as input */
/* MER to HiPS        */
/* aka HiPSgen case   */
/* ****************   */
let center = {"ra": 21, "dec": 19};
let radius = 0.001;
let pxsize = 0.0005;

let filelist = ["myfolder/file1.fits", "myfolder/file2.fits", "myfolder/file3.fits" ];

let outproj = new HiPSProjection(null, null, pxsize);
// the following loop should fill at each iteration the putput matrix
// foreach file in filelist
filelist.forEach((file) => {
    
    let inproj = new MercatorProjection(file);
    
    let cutoutFiles = WCSLight.cutout(center, radius, pxsize, inproj, outproj);
    
    for (cf of cutoutFiles) {

        let fitsheader = cf.fitsheader;
        let fitsdata = cf.fitsdata;
        let canvas2dlist = cf.canvas2dlist;
        let encodedData = WCSLight.writeFITS(fitsheader, fitsdata);
        
    }
});
    


/* ****************   */
/* ****************   */
/* CUTOUT Use Case 1  */
/* HiPS URI as input  */
/* HiPS to MER        */
/* PROMISE            */
/* ****************   */
let center = {"ra": 21, "dec": 19};
let radius = 0.001;
let pxsize = 0.0005;

let hipsBaseUri = "http://<base hips URL> or <base file system dir";
let inproj = new HiPSProjection(null, hipsBaseUri, pxsize);

let outproj = new MercatorProjection();

let cutoutFiles = WCSLight.cutout(center, radius, pxsize, inproj, outproj).then( (result) => {
    let fitsheader = result.fitsheader;
    let fitsdata = result.fitsdata;
    let canvas2dlist = result.canvas2dlist;
    let encodedData = WCSLight.writeFITS(fitsheader, fitsdata);
});
/** END CUTOUT use case */



/* **************** */
/* **************** */
/** Canvas use case */
/** From HiPS file  */
/* PROMISE          */
/* **************** */
let fileuri = "<path_file_to_fits>.fits";
let inproj = new HiPSProjection();
inproj.loadFITS(fileuri, observerList).then( (fits) => {
    let fitsheader = fits.header;
    let fitsdata = fits.data;
    // inproj.computePixValues();
    let canvas = new Canvas2D(fits.data); // projection type can be taken directly from the FITS
    canvas.process(); // imgsrc is the jpg/png
    canvas.setMinMax(min, max);
    canvas.setTfunction(tfunction);
    canvas.setColorMap(colorMap);
    let imgsrc2 = canvas.process(); // imgsrc is the jpg/png
    canvas.reset();
});
/** END Canvas use case */