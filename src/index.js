import WCSLight from "./WCSLight";


let wcsl = new WCSLight({"ra": 21, "dec": 19}, 0.001, 0.0005, "Mercator", "HiPS");
let hipsTilesMap = wcsl.getHiPSTilesMap();
let norder = hipsTilesMap.getNorder();

let baseUri = "http://<base hips URL> or <base file system dir"+"/Norder"+norder;

hipsTilesMap.forEach(function(value, key) {
    let fitsParser = new FITSParser(baseUri+"/Dir***"+key+".fits");
    // let header = fitsParser.getFITSHeader();
    let imgData = fitsParser.getImageData();
    wcsl.fillOutputImage(imgData, key);
});
let imageData = wcsl.getOutputImage ();
imageData.setTransferFunction("blablabla");
imageData.setColorMap("blablabla");
imageData.setInverse(true);
imageData.setMinMax(minVal, maxVal);
let imageHeader = wcsl.getOutputProjection.getFITSHeader ();
fitsParser.write(imageData, imageHeader);

