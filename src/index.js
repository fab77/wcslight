import WCSLight from "./WCSLight";


let wcsl = new WCSLight({"ra": 21, "dec": 19}, 0.001, 0.0005, "Mercator", "HiPS");
let hipsTilesMap = wcsl.getHiPSTilesMap();
let norder = hipsTilesMap.getNorder();

let baseUri = "http://<base hips URL> or <base file system dir"+"/Norder"+norder;

hipsTilesMap.forEach(function(value, key) {
    let fitsParser = new FITSParser(baseUri+"/Dir***"+key+".fits");
    
    fits = new FITSParser(inFiles[i]);
    fitsheader = fits.header;
    fitsdata = fits.data;
    min = fitsheader.getValue("DATAMIN");
    max = fitsheader.getValue("DATAMAX");
    /*
    wcsl.prepareFitsHeader(fitsParser.getFITSHeader()) verrebbe chiamato n volte.
    In teoria blank, bscale, bzero, ctype# dovrebbero essere sempre gli stessi.
    Che fare se cosi non fosse?
    */
    wcsl.prepareFitsHeader(fitsheader); // ???
    wcsl.fillOutputImage(fitsdata, min, max, key); // BLANK here?
});

let imageData = wcsl.getOutputImage ();
imageData.setTransferFunction("log");
imageData.setColorMap("planck");
imageData.setInverse(true);
imageData.setMinMax(minVal, maxVal);
imageData.update();
let pixelMatrix = imageData.getRawImage(); // to retrieve the pixels matrix
let fitsTable = imageData.getImage(); // to retrieve the pixels value 
let browse = imageData.getCanvas2DBrowse();

let imageHeader = wcsl.getOutputProjection.getFITSHeader ();
fitsParser.write(imageData, imageHeader);



/**
 * example with a different in projection
 * let imagin that the user identifes on premises 4 input FITS files in Collingnon projection
 */

let inFiles = ["./collignon1.fits", "./collignon2.fits", "./collignon3.fits", "./collignon4.fits"];
let wcsl = new WCSLight({"ra": 21, "dec": 19}, 0.001, 0.0005, "Mercator", "Collignon");
let fits, imgData, min, max;
for (let i = 0; i < inFiles.length; i++) {

    fits = new FITSParser(inFiles[i]);
    fitsheader = fits.header;
    fitsdata = fits.data;

    // imgData = fits.getImageData();
    min = fitsheader.getValue("DATAMIN");
    max = fitsheader.getValue("DATAMAX");
    

    if (i == 0) {
        wcsl.prepareFitsHeader(fitsheader);
    }
    
    wcsl.fillOutputImage(fitsdata, min, max);

}
    
let imageData = wcsl.getOutputImage();
imageData.setTransferFunction("log");
imageData.setColorMap("planck");
imageData.setInverse(true);
imageData.setMinMax(minVal, maxVal);
// TODO better to allow passing into update() min, max, tfunction, cmap, inverse as params 
imageData.update();

let pixelMatrix = imageData.getRawImage(); // to retrieve the pixels matrix
let fitsTable = imageData.getImage(); // to retrieve the pixels value 
let browse = imageData.getCanvas2DBrowse();

let imageHeader = wcsl.getOutputProjection.getFITSHeader ();
fitsParser.write(imageData, imageHeader);
