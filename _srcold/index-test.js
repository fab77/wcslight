import HiPSProjection from "./projections/HiPSProjection";

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

