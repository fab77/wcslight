/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FITSParser } from 'jsfitsio';
import { FITSHeader } from 'jsfitsio';
import { FITSHeaderItem } from 'jsfitsio';
import { ParseUtils } from 'jsfitsio';
import { ImagePixel } from '../model/ImagePixel.js';
import { Point } from '../model/Point.js';
import { CoordsType } from '../model/CoordsType.js';
import { NumberType } from '../model/NumberType.js';
import { exit } from 'process';
export class MercatorProjection {
    constructor() {
        this._wcsname = "MER"; // TODO check WCS standard and create ENUM
        this._ctype1 = "RA---MER";
        this._ctype2 = "DEC--MER";
        this._pxvalues = new Map();
        this._fitsheader = new Array();
    }
    initFromFile(infile) {
        return __awaiter(this, void 0, void 0, function* () {
            let fp = new FITSParser(infile);
            this._infile = infile;
            this._fitsUsed.push(infile);
            let promise = fp.loadFITS().then(fits => {
                // console.log(fits.header);
                this._pxvalues.set(0, fits.data);
                this._fitsheader[0] = fits.header;
                this._naxis1 = fits.header.get("NAXIS1");
                this._naxis2 = fits.header.get("NAXIS2");
                this._craDeg = fits.header.getItemListOf("CRVAL1")[0].value;
                this._cdecDeg = fits.header.getItemListOf("CRVAL2")[0].value;
                // TODO CDELT could not be present. In this is the case, 
                // there should be CDi_ja, but I am not handling them atm
                // [Ref. Representation of celestial coordinates in FITS - equation (1)]
                // this._pxsize1 = this._fitsheader[0].getItemListOf("CDELT1")[0].value as number;
                // this._pxsize2 = this._fitsheader[0].getItemListOf("CDELT2")[0].value as number;
                const pxsize1 = this._fitsheader[0].getItemListOf("CDELT1")[0].value;
                const pxsize2 = this._fitsheader[0].getItemListOf("CDELT2")[0].value;
                if (pxsize1 !== pxsize2 || pxsize1 === undefined || pxsize2 === undefined) {
                    throw new Error("pxsize1 is not equal to pxsize2");
                    exit;
                }
                this._pxsize = pxsize1;
                // this._minra = this._craDeg - this._pxsize1 * this._naxis1 / 2;
                this._minra = this._craDeg - this._pxsize * this._naxis1 / 2;
                if (this._minra < 0) {
                    this._minra += 360;
                }
                // this._mindec = this._cdecDeg - this._pxsize2 * this._naxis2 / 2;
                this._mindec = this._cdecDeg - this._pxsize * this._naxis2 / 2;
                return fits;
            });
            yield promise;
            return promise;
        });
    }
    extractPhysicalValues(fits) {
        let bzero = fits.header.get("BZERO");
        let bscale = fits.header.get("BSCALE");
        let naxis1 = fits.header.get("NAXIS1");
        let naxis2 = fits.header.get("NAXIS2");
        let bitpix = fits.header.get("BITPIX");
        let bytesXelem = Math.abs(bitpix / 8);
        let blankBytes = ParseUtils.convertBlankToBytes(fits.header.get("BLANK"), bytesXelem); // TODO => ??????? Im not using it. it should be used!
        // let physicalvalues = new Array[naxis2][naxis1];
        let physicalvalues = new Array(naxis2);
        for (let n2 = 0; n2 < naxis2; n2++) {
            physicalvalues[n2] = new Array(naxis1);
            for (let n1 = 0; n1 < naxis1; n1++) {
                let pixval = ParseUtils.extractPixelValue(0, fits.data[n2].slice(n1 * bytesXelem, (n1 + 1) * bytesXelem), bitpix);
                let physicalVal = bzero + bscale * pixval;
                physicalvalues[n2][n1] = physicalVal;
            }
        }
        return physicalvalues;
    }
    prepareFITSHeader(fitsHeaderParams) {
        this._fitsheader[0] = new FITSHeader();
        this._fitsheader[0].addItemAtTheBeginning(new FITSHeaderItem("BITPIX", fitsHeaderParams.get("BITPIX")));
        this._fitsheader[0].addItemAtTheBeginning(new FITSHeaderItem("SIMPLE", fitsHeaderParams.get("SIMPLE")));
        if (fitsHeaderParams.get("BLANK") !== undefined) {
            this._fitsheader[0].addItem(new FITSHeaderItem("BLANK", fitsHeaderParams.get("BLANK")));
        }
        let bscale = 1.0;
        if (fitsHeaderParams.get("BSCALE") !== undefined) {
            bscale = fitsHeaderParams.get("BSCALE");
        }
        this._fitsheader[0].addItem(new FITSHeaderItem("BSCALE", bscale));
        let bzero = 0.0;
        if (fitsHeaderParams.get("BZERO") !== undefined) {
            bzero = fitsHeaderParams.get("BZERO");
        }
        this._fitsheader[0].addItem(new FITSHeaderItem("BZERO", bzero));
        this._fitsheader[0].addItem(new FITSHeaderItem("NAXIS", 2));
        this._fitsheader[0].addItem(new FITSHeaderItem("NAXIS1", this._naxis1));
        this._fitsheader[0].addItem(new FITSHeaderItem("NAXIS2", this._naxis2));
        this._fitsheader[0].addItem(new FITSHeaderItem("CTYPE1", "'" + this._ctype1 + "'"));
        this._fitsheader[0].addItem(new FITSHeaderItem("CTYPE2", "'" + this._ctype2 + "'"));
        this._fitsheader[0].addItem(new FITSHeaderItem("CDELT1", this._pxsize)); // ??? Pixel spacing along axis 1 ???
        this._fitsheader[0].addItem(new FITSHeaderItem("CDELT2", this._pxsize)); // ??? Pixel spacing along axis 2 ???
        this._fitsheader[0].addItem(new FITSHeaderItem("CRPIX1", this._naxis1 / 2)); // central/reference pixel i along naxis1
        this._fitsheader[0].addItem(new FITSHeaderItem("CRPIX2", this._naxis2 / 2)); // central/reference pixel j along naxis2
        this._fitsheader[0].addItem(new FITSHeaderItem("CRVAL1", this._craDeg)); // central/reference pixel RA
        this._fitsheader[0].addItem(new FITSHeaderItem("CRVAL2", this._cdecDeg)); // central/reference pixel Dec
        let min = bzero + bscale * this._minphysicalval;
        let max = bzero + bscale * this._maxphysicalval;
        this._fitsheader[0].addItem(new FITSHeaderItem("DATAMIN", min)); // min data value
        this._fitsheader[0].addItem(new FITSHeaderItem("DATAMAX", max)); // max data value
        this._fitsheader[0].addItem(new FITSHeaderItem("ORIGIN", "'WCSLight v.0.x'"));
        this._fitsheader[0].addItem(new FITSHeaderItem("COMMENT", "'WCSLight v0.x developed by F.Giordano and Y.Ascasibar'"));
        this._fitsheader[0].addItem(new FITSHeaderItem("END"));
        return this._fitsheader;
    }
    getFITSHeader() {
        return this._fitsheader;
    }
    getCommonFitsHeaderParams() {
        let header = new FITSHeader();
        for (const [key, value] of this._fitsheader[0]) {
            // I could add a list of used NPIXs to be included in the comment of the output FITS
            if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER",].includes(key)) {
                header.addItem(new FITSHeaderItem(key, value));
            }
        }
        return header;
    }
    get fitsUsed() {
        return this._fitsUsed;
    }
    getPixValues(inputPixelsList) {
        return __awaiter(this, void 0, void 0, function* () {
            let promise = new Promise((resolve, reject) => {
                try {
                    let bytesXelem = Math.abs(this._fitsheader[0].get("BITPIX") / 8);
                    let blankBytes = ParseUtils.convertBlankToBytes(this._fitsheader[0].get("BLANK"), bytesXelem);
                    let pixcount = inputPixelsList.length;
                    let values = new Uint8Array(pixcount * bytesXelem);
                    for (let p = 0; p < pixcount; p++) {
                        let imgpx = inputPixelsList[p];
                        // TODO check when input is undefined. atm it puts 0 bur it should be BLANK
                        // TODO why I am getting negative i and j? check world2pix!!!
                        if ((imgpx._j) < 0 || (imgpx._j) >= this._naxis2 ||
                            (imgpx._i) < 0 || (imgpx._i) >= this._naxis1) {
                            for (let b = 0; b < bytesXelem; b++) {
                                values[p * bytesXelem + b] = blankBytes[b];
                            }
                        }
                        else {
                            let pv = this._pxvalues.get(0);
                            if (pv !== undefined) {
                                for (let b = 0; b < bytesXelem; b++) {
                                    values[p * bytesXelem + b] = pv[imgpx._j][(imgpx._i) * bytesXelem + b];
                                }
                            }
                        }
                    }
                    resolve(values);
                }
                catch (err) {
                    reject("[MercatorProjection] ERROR: " + err);
                }
            });
            return promise;
        });
    }
    computeSquaredNaxes(d, ps) {
        // first approximation to be checked
        this._naxis1 = Math.ceil(d / ps);
        this._naxis2 = this._naxis1;
        this._pxsize = ps;
    }
    setPxsValue(values, fitsHeaderParams) {
        let bytesXelem = Math.abs(fitsHeaderParams.get("BITPIX") / 8);
        let minpixb = ParseUtils.extractPixelValue(0, values.slice(0, bytesXelem), fitsHeaderParams.get("BITPIX"));
        let maxpixb = minpixb;
        let bscale = (fitsHeaderParams.get("BSCALE") !== undefined) ? fitsHeaderParams.get("BSCALE") : 1.0;
        let bzero = (fitsHeaderParams.get("BZERO") !== undefined) ? fitsHeaderParams.get("BZERO") : 0.0;
        this._minphysicalval = bzero + bscale * minpixb;
        this._maxphysicalval = bzero + bscale * maxpixb;
        // this._pxvalues = new Array(this._naxis2);
        // for (let r = 0; r < this._naxis2; r++) {
        //     this._pxvalues[r] = new Uint8Array(this._naxis1 * bytesXelem);
        // }
        // this._pxvalues.set(0, new Uint8Array[this._naxis2][this._naxis1 * bytesXelem]);
        this._pxvalues.set(0, new Array(this._naxis2));
        let pv = this._pxvalues.get(0);
        if (pv !== undefined) {
            for (let r = 0; r < this._naxis2; r++) {
                pv[r] = new Uint8Array(this._naxis1 * bytesXelem);
            }
            let r;
            let c;
            let b;
            for (let p = 0; (p * bytesXelem) < values.length; p++) {
                // console.log("processing "+p + " of "+ (values.length / bytesXelem));
                try {
                    r = Math.floor(p / this._naxis1);
                    c = (p - r * this._naxis1) * bytesXelem;
                    for (b = 0; b < bytesXelem; b++) {
                        pv[r][c + b] = values[p * bytesXelem + b];
                    }
                    let valpixb = ParseUtils.extractPixelValue(0, values.slice(p * bytesXelem, (p * bytesXelem) + bytesXelem), fitsHeaderParams.get("BITPIX"));
                    let valphysical = bzero + bscale * valpixb;
                    if (valphysical < this._minphysicalval || isNaN(this._minphysicalval)) {
                        this._minphysicalval = valphysical;
                    }
                    else if (valphysical > this._maxphysicalval || isNaN(this._maxphysicalval)) {
                        this._maxphysicalval = valphysical;
                    }
                }
                catch (err) {
                    console.log(err);
                    console.log("p " + p);
                    console.log("r %, c %, b %" + r, c, b);
                    console.log("this._pxvalues[r][c + b] " + pv[r][c + b]);
                    console.log("values[p * bytesXelem + b] " + values[p * bytesXelem + b]);
                }
            }
        }
        this.prepareFITSHeader(fitsHeaderParams);
        return this._pxvalues;
    }
    getImageRADecList(center, radius, pxsize) {
        this.computeSquaredNaxes(2 * radius, pxsize); // compute naxis[1, 2]
        this._pxsize = pxsize;
        this._minra = center.astro.raDeg - radius;
        if (this._minra < 0) {
            this._minra += 360;
        }
        this._mindec = center.astro.decDeg - radius;
        let radeclist = new Array();
        for (let d = 0; d < this._naxis2; d++) {
            for (let r = 0; r < this._naxis1; r++) {
                radeclist.push([this._minra + (r * this._pxsize), this._mindec + (d * this._pxsize)]);
            }
        }
        let cidx2 = (this._naxis2 / 2 - 1) * this._naxis1 + this._naxis1 / 2;
        let cidx3 = (this._naxis2 / 2) * this._naxis1 + this._naxis1 / 2;
        let cidx = Math.ceil(radeclist.length / 2);
        this._craDeg = radeclist[cidx][0];
        this._cdecDeg = radeclist[cidx][1];
        return radeclist;
    }
    // getImageRADecList(center: AstroCoords, radius: number, pxsize: number): Promise<number[][]> {
    //     let promise = new Promise<[]> ( (resolve, reject) => {
    //         this.computeSquaredNaxes (2 * radius, pxsize); // compute naxis[1, 2]
    //         this._pxsize = pxsize;
    //         this._minra = center.raDeg - radius;
    //         if (this._minra < 0) {
    //             this._minra += 360;
    //         }
    //         this._mindec = center.decDeg - radius;
    //         let radeclist:number[][] = new Array<Array<number>>();
    //         for (let d = 0; d < this._naxis2; d++) {
    //             for (let r = 0; r < this._naxis1; r++) {
    //                 radeclist.push([ this._minra + (r * this._pxsize), this._mindec + (d * this._pxsize)]);
    //             }    
    //         }
    //         let cidx = (this._naxis2/2 - 1) * this._naxis1 +  this._naxis1/2;
    //         this._craDeg = radeclist[ cidx ][0];
    //         this._cdecDeg = radeclist[ cidx ][1];
    //         resolve(radeclist);
    //     });
    //     return promise;
    // }
    /** TODO !!! check and handle RA passing through 360-0 */
    pix2world(i, j) {
        let ra;
        let dec;
        // ra = i * this._stepra + this._minra;
        // dec = j * this._stepdec + this._mindec;
        ra = i * this._pxsize + this._minra;
        dec = j * this._pxsize + this._mindec;
        let p = new Point(CoordsType.ASTRO, NumberType.DEGREES, ra, dec);
        return p;
        // return [ra, dec];
    }
    // world2pix (radeclist: number[][]): Promise<ImagePixel[]> {
    //     let promise = new Promise<ImagePixel[]> ( (resolve, reject) => {
    //         this.initFromFile(this._infile).then( (data) => {
    //             let imgpxlist = [];
    //             for (let radecItem of radeclist) {
    //                 let ra = radecItem[0];
    //                 let dec = radecItem[1];
    //                 let i = Math.floor((ra - this._minra) / this._pxsize1);
    //                 let j = Math.floor((dec - this._mindec) / this._pxsize2);
    //                 imgpxlist.push(new ImagePixel(i, j));
    //             }
    //             resolve(imgpxlist);
    //         });
    //     });
    //     return promise;
    // }
    world2pix(radeclist) {
        let imgpxlist = [];
        for (let radecItem of radeclist) {
            let ra = radecItem[0];
            let dec = radecItem[1];
            // let i = Math.floor((ra - this._minra) / this._pxsize1);
            // let j = Math.floor((dec - this._mindec) / this._pxsize2);
            let i = Math.floor((ra - this._minra) / this._pxsize);
            let j = Math.floor((dec - this._mindec) / this._pxsize);
            imgpxlist.push(new ImagePixel(i, j));
        }
        return imgpxlist;
    }
}
//# sourceMappingURL=MercatorProjection.js.map