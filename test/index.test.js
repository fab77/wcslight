import assert, { doesNotMatch } from 'assert';
import HiPSProjection from '../src/projections/HiPSProjection.js';
import MercatorProjection from '../src/projections/MercatorProjection.js';
import WCSLight from '../src/WCSLight.js';
import Canvas2D from '../src/model/Canvas2D.js'


// describe("CUTOUT Use Case 1", function() {
//     it("HiPS URI as input - HPX to MER - Promise", (done) => {
//         // let center = {"ra": 11.0138469, "dec": 41.6047723};
//         let center = {"ra": 9.0886017, "dec": 45.6644347};
//         let radius = 0.2;
//         let pxsize = 0.0005;

//         let hipsBaseUri = "http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/";
//         let inproj = new HiPSProjection(null, hipsBaseUri, pxsize);

//         let outproj = new MercatorProjection();

//         WCSLight.cutout(center, radius, pxsize, inproj, outproj).then( (result) => {
//             let fitsheader = result.fitsheader;
//             console.log(fitsheader);
//             assert.equal(fitsheader.get('CRVAL1'), '11.0138469');
//             let fitsdata = result.fitsdata;
//             let canvas2d = result.canvas2d;
//             canvas2d.process();
//             let img = canvas2d.getCanvas2DBrowse();
//             let encodedData = WCSLight.writeFITS(fitsheader, fitsdata);
//             done();
//         }).catch(done);
//     });
// });



// describe("CUTOUT Use Case 2", function() {
//     it("MER to HPX - Promise", (done) => {
//         let center = {"ra": 356.05, "dec": 0.62};
//         let radius = 0.001;
//         let pxsize = 0.0005;

//         let infile = "./input/Mercator.fits";
//         let inproj = new MercatorProjection(infile);
        
//         let outHiPSDir = "./output/";
//         let outproj = new HiPSProjection(null, outHiPSDir, pxsize);

//         WCSLight.cutout(center, radius, pxsize, inproj, outproj).then( (result) => {
//             let fitsheader = result.fitsheader;
//             console.log(fitsheader);
//             let fitsdata = result.fitsdata;
//             let canvas2d = result.canvas2d;
//             let encodedData = WCSLight.writeFITS(fitsheader, fitsdata);
//             done();   
//         }).catch(done);
//     });
// });



// describe("Load Canvas Use Case 1", function() {
//     it("HPX - Promise", (done) => {
        
//         let infile = "https://skies.esac.esa.int/Herschel/normalized/PACS_hips160//Norder8/Dir40000/Npix43348.fits";
//         let proj = new HiPSProjection(infile).then( (res) => {
//             console.log(res.fitsheader);
//             console.log(res.fitsdata.length);
//             let canvas2d = res.canvas2d;
//             canvas2d.process();
//             let img = canvas2d.getCanvas2DBrowse();
//             canvas2d.setTransferFunction("sqrt");
//             canvas2d.process();
//             img = canvas2d.getCanvas2DBrowse();
//             done();
//         }).catch(function(err){
//             console.log("[index.js] "+err);
//         });
        
//     });
});