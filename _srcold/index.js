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
let canvas = inproj.getCanvas2d("linear", "grayscale", false); // projection type can be taken directly from the FITS
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
let canvas = inproj.getCanvas2d("linear", "grayscale", false); // projection type can be taken directly from the FITS
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

let cutout = WCSLight.cutout(center, radius, pxsize, inproj, outproj);

let fitsheader = cutout.fitsheader;
let fitsdata = cutout.fitsdata;
let canvas2d = cutout.canvas2d;

let encodedData = WCSLight.writeFITS(fitsheader, fitsdata);
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
let inproj = new HiPSProjection(filelist);

let outproj = new MercatorProjection();

let cutout = WCSLight.cutout(center, radius, pxsize, inproj, outproj);

let fitsheader = cutout.fitsheader;
let fitsdata = cutout.fitsdata;
let canvas2d = cutout.canvas2d;

let encodedData = WCSLight.writeFITS(fitsheader, fitsdata);
/** END CUTOUT use case */


/* ****************   */
/* ****************   */
/* CUTOUT Use Case 3  */
/* file list as input */
/* MER to HiPS        */
/* ****************   */
let center = {"ra": 21, "dec": 19};
let radius = 0.001;
let pxsize = 0.0005;



let hipsBaseUri = "http://<base hips URL> or <base file system dir";
let outproj = new HiPSProjection(null, hipsBaseUri, pxsize);

let filelist = ["myfolder/file1.fits", "myfolder/file2.fits", "myfolder/file3.fits" ];
// the following loop should fill at each iteration the putput matrix
// foreach file in filelist
filelist.forEach((file) => function () {
    let inproj = new MercatorProjection(file);
    let cutout = WCSLight.cutout(center, radius, pxsize, inproj, outproj);
});
    
