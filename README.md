# wcslight
WCSLight is a TypeScript library designed to manipulate data projections in standard FITS format and implements the standard WCS functions pix2world and world2pix. It offers a cutout functionality on single FITS files and entire HiPS, using parameters in input such as central Right Ascension (RA) and Declination (Dec), pixel size, radius, and the desired output projection (Cartesian or HiPS). Future updates will include additional projections.

At the moment it supports only HiPS and Cartesian projections.

## Known limitations:
At the moment tested with HiPS tiles of 512x512. With other tile size it might fail.

## How to use the generated library available in Nodejs repository
Include the following dependency into package.json file in your project:
```
"dependencies": {
        "wcslight": "^1.0.19"
    },
```

## Installing as Javascript external file in a web page

Download the file "wcslight.js" under _bundle directory and include it in your web page.

## Deployment as Node module

- Prerequisites:
  [Node.js](https://nodejs.org) v<=16
  (see [installation instructions](https://nodejs.org/en/download/package-manager))

- Clone repo:
```
git clone https://github.com/fab77/wcslight.git
```

- Move into the wcslight folder:
```
cd wcslight
```

- Install the required `dev` modules:
```
npm i
```

- Compile the project:
```
npm run start:dev
```

## Using WCSLight in another Node project
```
import { WCSLight, HiPSProjection, MercatorProjection, Point, CoordsType, NumberType } from 'wcslight';

const hipsBaseUri = "https://skies.esac.esa.int/Herschel/normalized/PACS_hips160/"
const center = {"ra": 306.40, "dec": 40};
const radius = 0.01;
const pxsize = 0.0005;

let inproj = new HiPSProjection(null, hipsBaseUri, null, 8);
let outproj = new MercatorProjection();

WCSLight.cutout(center, radius, pxsize, inproj, outproj).then( (result) => {
    const fitsheader = result.fitsheader;
    console.log(fitsheader);    
    const fitsdata = result.fitsdata;
    const canvas2d = result.canvas2d;
    const img = canvas2d.getCanvas2DBrowse();
    let encodedData = WCSLight.writeFITS(fitsheader, fitsdata, './output/test.fits');

}).catch(function(err){
    console.log(err);
});
```


 
