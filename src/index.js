import WCSLight from "./WCSLight";

/* **************** */
/* **************** */
/** CUTOUT Use Case */
/* **************** */
/* **************** */
let baseUri = "http://<base hips URL> or <base file system dir";
let image = WCSLight.cutout({"ra": 21, "dec": 19}, 0.001, 0.0005, "HiPS", "Mercator", null, baseUri);
let fitsparsed = image.getFITSData();
let encodedData = WCSLight.writeFITS(fitsparsed.FITSHeader, fitsparsed.FITSData);
let canvas2d =  image.generateCanvas2d();
/** END CUTOUT use case */


/* **************** */
/* **************** */
/** Canvas use case */
/* **************** */
/* **************** */
let fileuri = new FITSParser("<path_file_to_fits>.fits");
let canvas = WCSLight.getCanvas2D(fileuri, "HiPS"); // projection type can be taken directly from the FITS
canvas.setMinMax(min, max);
canvas.setTfunction(tfunction);
canvas.setColorMap(colorMap);
let imgsrc = canvas.process(); // imgsrc is the jpg/png
canvas.reset();
/** END Canvas use case */

