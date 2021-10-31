
// const assert = require('assert').strict;
import HiPSProjection from '../src/projections/HiPSProjection.js';
import MercatorProjection from '../src/projections/MercatorProjection.js';
import WCSLight from '../src/WCSLight.js';
import Canvas2D from '../src/model/Canvas2D.js'
// const p = require('../src/projections/MercatorProjection')

// describe("Canvas generation tests", function() {
//     it("single HiPS file in input", (done) => {
//         let fileuri = "/Users/fgiordano/Workspace/GitHub/FITSParser/test/inputs/Npix278.fits";
//         let inproj = new HiPSProjection();
//         inproj.loadFITS(fileuri).then( (fits) => {
//             let fitsheader = fits.header;
//             let fitsdata = fits.data;
//             let canvas = new Canvas2D(fits.data); // projection type can be taken directly from the FITS
//             canvas.process(); // imgsrc is the jpg/png
//             canvas.setMinMax(min, max);
//             canvas.setTfunction(tfunction);
//             canvas.setColorMap(colorMap);
//             let imgsrc2 = canvas.process(); // imgsrc is the jpg/png
//             canvas.reset();
//             done();
//         }).catch(done);
//     });
// });



describe("CUTOUT Use Case 1", function() {
    it("HiPS URI as input - HPX to MER - Promise", (done) => {
        let center = {"ra": 11.0138469, "dec": 41.6047723};
        let radius = 0.001;
        let pxsize = 0.0005;

        let hipsBaseUri = "http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/";
        let inproj = new HiPSProjection(null, hipsBaseUri, pxsize);

        let outproj = new MercatorProjection();

        WCSLight.cutout(center, radius, pxsize, inproj, outproj).then( (result) => {
            let fitsheader = result.fitsheader;
            let fitsdata = result.fitsdata;
            let canvas2d = result.canvas2d;
            let encodedData = WCSLight.writeFITS(fitsheader, fitsdata);
            done();
        }).catch(done);
        
    });
});



describe("CUTOUT Use Case 2", function() {
    it("MER to HPX - Promise", (done) => {
        let center = {"ra": 356.05, "dec": 0.62};
        let radius = 0.001;
        let pxsize = 0.0005;

        let infile = "./input/Mercator.fits";
        let inproj = new MercatorProjection(infile);

        let outproj = new HiPSProjection(null, hipsBaseUri, pxsize);

        WCSLight.cutout(center, radius, pxsize, inproj, outproj).then( (result) => {
            let fitsheader = result.fitsheader;
            let fitsdata = result.fitsdata;
            let canvas2d = result.canvas2d;
            let encodedData = WCSLight.writeFITS(fitsheader, fitsdata);
            done();
        }).catch(done);
        
    });
});



describe("Load Canvas Use Case 1", function() {
    it("HPX - Promise", (done) => {
        
        let infile = "https://skies.esac.esa.int/Herschel/normalized/PACS_hips160//Norder8/Dir40000/Npix43348.fits";
        let proj = new HiPSProjection(infile).then(res => {
            console.log(res.fitsheader);
            console.log(res.fitsdata.lenght);
            let canvas = res.canvas2d;
        });
        
    });
});