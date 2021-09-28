import WCSLight from "./WCSLight";


let wcsl = new WCSLight({"ra": 21, "dec": 19}, 0.001, 0.0005, "Mercator", "HiPS");
let tilesMap = wcsl.getHiPSTilesMap();

let fitsParser = new FITSParser("http://<base hips URL"+tile+".fits");

tilesMap.array.forEach(tile, pxList => {
    fitsParser.load(tile);
    wcsl.fillOutputImage(fitsParser.data, fitsParser.header, tile);
});
let imageData = wcsl.getOutputProjection.getOutputImage ();
let imageHeader = wcsl.getOutputProjection.getFITSHeader();
fitsParser.write(imageData, imageHeader);

