import WCSLight from "./WCSLight";


let wcsl = new WCSLight({"ra": 21, "dec": 19}, 0.001, 0.0005, "Mercator", "HiPS");
let hipsTilesMap = wcsl.getHiPSTilesMap();
let norder = hipsTilesMap.getNorder();

let baseUri = "http://<base hips URL> or <base file system dir"+"/Norder"+norder;

hipsTilesMap.forEach(function(value, key) {
    let fitsParser = new FITSParser(baseUri+"/Dir***"+key+".fits");
    // let header = fitsParser.getFITSHeader();
    let imgData = fitsParser.getImageData();
    let min = fitsParser.getMin();
    let max = fitsParser.getMax();
    wcsl.fillOutputImage(imgData.buffer, min, max, key);
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

