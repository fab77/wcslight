import HiPSProjection from '../src/projections/HiPSProjection.js';
import MercatorProjection from '../src/projections/MercatorProjection.js';
import WCSLight from '../src/WCSLight.js';



/** MER to HPX */
    
// let center = {"ra": 356.05, "dec": 0.62};
// let center = {"ra": 356.0, "dec": 0.5177778};
// let radius = 0.001;
// let pxsize = 0.0005;

// let infile = "./input/Mercator.fits";
// // let inproj = 
// let inproj = new MercatorProjection(infile);
// let outHiPSDir = "./output/"
// let outproj = new HiPSProjection(null, outHiPSDir, pxsize);

// WCSLight.cutout(center, radius, pxsize, inproj, outproj).then( (result) => {
//     let fitsheader = result.fitsheader;
//     console.log(fitsheader);
//     let fitsdata = result.fitsdata;
//     let canvaslist = result.canvas2d;
//     for (let canvas of canvaslist) {
//         canvas.process();
//         let img = canvas.getCanvas2DBrowse();
//     }
//     for (let i = 0; i < fitsheader.length; i++) {
//         let encodedData = WCSLight.writeFITS(fitsheader[i], fitsdata[i]);
//     }
    
    
// });


// let center = {"ra": 11.0138469, "dec": 41.6047723};
// let radius = 0.5;
// let pxsize = 0.0005;
// // let pxsize = 0.01;
// let hipsBaseUri = "http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/";
// // let inproj = new HiPSProjection(null, hipsBaseUri, pxsize);
// let inproj = new HiPSProjection(null, hipsBaseUri, null, 8);

// let outproj = new MercatorProjection();

// WCSLight.cutout(center, radius, pxsize, inproj, outproj).then( (result) => {
//     let fitsheader = result.fitsheader;
//     console.log(fitsheader);    
//     let fitsdata = result.fitsdata;
//     let canvas2d = result.canvas2d;
//     canvas2d.process();
//     let img = canvas2d.getCanvas2DBrowse();
//     let encodedData = WCSLight.writeFITS(fitsheader, fitsdata);

// }).catch(function(err){
//     console.log("[index.js] "+err);
// });




let infile = "https://skies.esac.esa.int/Herschel/normalized/PACS_hips160//Norder8/Dir40000/Npix43348.fits";
let proj = new HiPSProjection(infile).then( (res) => {
    console.log(res.fitsheader);
    console.log(res.fitsdata.length);
    let canvas2d = res.canvas2d;
    canvas2d.process();
    let img = canvas2d.getCanvas2DBrowse();
    canvas2d.setTransferFunction("sqrt");
    canvas2d.process();
    img = canvas2d.getCanvas2DBrowse();
}).catch(function(err){
        console.log("[index.js] "+err);
    });
    

// proj.initFromFile(infile).then( (res) => {
//     console.log(res.fitsheader);
//     console.log(res.fitsdata.lenght);
//     let canvas = res.canvas2d;
// });


        