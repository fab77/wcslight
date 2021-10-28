
// const assert = require('assert').strict;
import HiPSProjection from '../src/projections/HiPSProjection.js';
// const p = require('../src/projections/MercatorProjection')

describe("Canvas generation tests", function() {
    it("HiPS input", function() {
        let fileuri = "/Users/fgiordano/Workspace/GitHub/FITSParser/test/inputs/Npix278.fits";
        let inproj = new HiPSProjection([fileuri]);
        inproj.computePixValues();
        let canvas = inproj.getCanvas2d("linear", "grayscale", false); // projection type can be taken directly from the FITS
        canvas.process(); // imgsrc is the jpg/png
        canvas.setMinMax(min, max);
        canvas.setTfunction(tfunction);
        canvas.setColorMap(colorMap);
        let imgsrc2 = canvas.process(); // imgsrc is the jpg/png
        canvas.reset();
        
        console.log("Holaaaaaa");
    });
});


