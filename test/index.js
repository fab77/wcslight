import HiPSProjection from '../src/projections/HiPSProjection.js';
import MercatorProjection from '../src/projections/MercatorProjection.js';
import WCSLight from '../src/WCSLight.js';



/** HiPS to HiPS */
// let center = {"ra": 12.3503889, "dec": 50.7453515};
// let radius = 0.01;
// let pxsize = 0.0005;
//  let outHiPSDir = "./output/"
// // let pxsize = 0.01;
// let hipsBaseUri = "http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/";
// // let inproj = new HiPSProjection(null, hipsBaseUri, pxsize);
// let inproj = new HiPSProjection(null, hipsBaseUri, null, 8);

// let outproj = new HiPSProjection(null, outHiPSDir, null, 8);

// WCSLight.cutout(center, radius, pxsize, inproj, outproj).then( (result) => {
//     let fitsheader = result.fitsheader;
//     // console.log(fitsheader);    
//     let fitsdata = result.fitsdata;
//     let canvaslist = result.canvas2d;
//     for (let canvas of canvaslist) {
//         canvas.process();
//         let img = canvas.getCanvas2DBrowse();
//     }
//     // for (let i = 0; i < fitsheader.length; i++) {
//     let i = 0;
//     for (const [key, value] of Object.entries(fitsdata)) {
//         let tileno = key;
//         let data = value;
//         let header = fitsheader[i];
//         i++;
//         let encodedData = WCSLight.writeFITS(header, data);
//     }

// }).catch(function(err){
//     console.log("[index.js] "+err);
// });





/** HiPS to MER */
// let center = {"ra": 12.3503889, "dec": 50.7453515};
// let radius = 0.1;
// let pxsize = 0.0005;
// let hipsBaseUri = "http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/";
// let inproj = new HiPSProjection(null, hipsBaseUri, null, 8);

// let outproj = new MercatorProjection();

// WCSLight.cutout(center, radius, pxsize, inproj, outproj).then( (result) => {
//     let fitsheader = result.fitsheader;
//     console.log(fitsheader);    
//     let fitsdata = result.fitsdata;
//     let canvas2d = result.canvas2d;
//     // canvas2d.process();
//     // let img = canvas2d.getCanvas2DBrowse();
//     let encodedData = WCSLight.writeFITS(fitsheader, fitsdata);

// }).catch(function(err){
//     console.log("[index.js] "+err);
// });



/** MER to MER */
// let center = {"ra": 12.3503889, "dec": 50.7453515};
// let radius = 0.1;
// let pxsize = 0.0005;
// let infile = "./input/Mercator2.fits";

// let inproj = new MercatorProjection(infile);

// let outproj = new MercatorProjection();

// WCSLight.cutout(center, radius, pxsize, inproj, outproj).then( (result) => {
//     let fitsheader = result.fitsheader;
//     console.log(fitsheader);    
//     let fitsdata = result.fitsdata;
//     let canvas2d = result.canvas2d;
//     // canvas2d.process();
//     // let img = canvas2d.getCanvas2DBrowse();
//     let encodedData = WCSLight.writeFITS(fitsheader, fitsdata);

// }).catch(function(err){
//     console.log("[index.js] "+err);
// });




/** MER to HPX */
let center = {"ra": 12.3503889, "dec": 50.7453515};
let radius = 0.1;
let pxsize = 0.0005;

let infile = "./input/Mercator3.fits";

let inproj = new MercatorProjection(infile);
let outHiPSDir = "./output/"
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
        let encodedData = WCSLight.writeFITS(header, data);
    }
    // for (let i = 0; i < fitsheader.length; i++) {
    //     let encodedData = WCSLight.writeFITS(fitsheader[i], fitsdata[i]);
    // }
    
    
});


// let infile = "https://skies.esac.esa.int/Herschel/normalized/PACS_hips160//Norder8/Dir40000/Npix43348.fits";
// let proj = new HiPSProjection(infile).then( (res) => {
//     console.log(res.fitsheader);
//     console.log(res.fitsdata.length);
//     let canvas2d = res.canvas2d;
//     canvas2d.process();
//     let img = canvas2d.getCanvas2DBrowse();
//     canvas2d.setTransferFunction("sqrt");
//     canvas2d.process();
//     img = canvas2d.getCanvas2DBrowse();
// }).catch(function(err){
//         console.log("[index.js] "+err);
//     });

// let infile = "http://skies.esac.esa.int/Herschel/normalized/PACS_hips160//Norder3/Dir0/Npix42.fits";
// let proj = new HiPSProjection(infile).then( (res) => {
//     console.log(res.fitsheader);
//     console.log(res.fitsdata.length);
//     let canvas2d = res.canvas2d;
//     canvas2d.process();
//     let img = canvas2d.getCanvas2DBrowse();
//     canvas2d.setTransferFunction("sqrt");
//     canvas2d.process();
//     img = canvas2d.getCanvas2DBrowse();
// }).catch(function(err){
//         console.log("[index.js] "+err);
//     });
