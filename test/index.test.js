import assert, { doesNotMatch } from 'assert';
import HiPSProjection from '../src/projections/HiPSProjection.js';
import MercatorProjection from '../src/projections/MercatorProjection.js';
import WCSLight from '../src/WCSLight.js';
import Canvas2D from '../src/model/Canvas2D.js'


describe("CUTOUT Use Case 1", function() {
    it("MER to HPX", (done) => {
        let center = {"ra": 12.3503889, "dec": 50.7453515};
        let radius = 0.1;
        let pxsize = 0.0005;

        let infile = "./test/input/Mercator.fits";

        let inproj = new MercatorProjection(infile);
        let outHiPSDir = "./output/hips/";
        let outproj = new HiPSProjection(null, outHiPSDir, pxsize);
        
        WCSLight.cutout(center, radius, pxsize, inproj, outproj).then( (result) => {
            let fitsheader = result.fitsheader;
            console.log(fitsheader);
            let fitsdata = result.fitsdata;
            let canvaslist = result.canvas2d;
            for (let canvas of canvaslist) {
                canvas.process();
                let img = canvas.getCanvas2DBrowse();
            }
            let i = 0;
            for (const [key, value] of Object.entries(fitsdata)) {
                let tileno = key;
                let data = value;
                let header = fitsheader[i];
                i++;
                let hipstileno = header.getItemListOf("NPIX")[0].value;
                let order = header.getItemListOf("ORDER")[0].value;
                let dir = Math.floor(hipstileno/10000) * 10000;
                let fileuri = "./test/output/hips/Norder"+order+"/Dir"+dir+"/Npix"+hipstileno+".fits";
                let encodedData = WCSLight.writeFITS(header, data, fileuri);
                // assert
            }
                done();
        }).catch(done);
    });
});



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
// });