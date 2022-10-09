"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */
import { FITSParser } from 'jsfitsio';
import { FITSHeader } from 'jsfitsio';
import { FITSHeaderItem } from 'jsfitsio';
import { ParseUtils } from 'jsfitsio';
// import { FITSParser } from 'fitsparser/FITSParser-node';
// import { FITSHeader } from 'fitsparser/model/FITSHeader';
// import { FITSHeaderItem } from 'fitsparser/model/FITSHeaderItem';
// import { ParseUtils } from 'fitsparser/ParseUtils';
// import { FITSParsed } from 'fitsparser/model/FITSParsed';
import { Healpix } from "healpixjs";
import { Pointing } from "healpixjs";
import { HiPSHelper } from './HiPSHelper.js';
// TODO 
// import Canvas2D from '../model/Canvas2D.js';
import { ImagePixel } from '../model/ImagePixel.js';
import { astroToSpherical, degToRad, fillAstro, radToDeg } from '../model/Utils.js';
import { Point } from '../model/Point.js';
import { CoordsType } from '../model/CoordsType.js';
import { NumberType } from '../model/NumberType.js';
export class HiPSProjection {
    /**
     *
     * * ex with single local file:
     * let hp = new HiPSProjection('/mylocaldir/myfile.fits', null, null, null);
     * hp.initFromFile()
     *
     * * ex with single remote file:
     * let hp = new HiPSProjection('http://<hips-server>/Norder7/DirN/NpixXYZ.fits', null, null, null);
     * hp.initFromFile()
     *
     * * ex with HiPS server base local dir:
     * let hp = new HiPSProjection(null, <hips-local-root-dir>, pxsize, order);
     * hp.initFromBaseHiPSDir()
     *
     * * ex with HiPS server base URL:
     * let hp = new HiPSProjection(null, 'http://<hips-server>/<hips-root-dir>', pxsize, order);
     * hp.initFromBaseHiPSDir()
     *
     */
    //  constructor(fitsfilepath?: string, hipsBaseURI?: string, pxsize?: number, order?: number) {
    constructor() {
        // super();
        this._wcsname = "HPX"; // TODO check WCS standard
        this._ctype1 = "RA---HPX";
        this._ctype2 = "DEC--HPX";
        // this.THETAX = Hploc.asin( (K - 1)/K );
        // if (!fitsfilepath && !hipsBaseURI) {
        // 	throw new Error("One among fitsfilepath and hipsURI must be provided.")
        // }
        // if (hipsBaseURI && !pxsize && !order) {
        // 	throw new Error("One among pxsize and order must be provided.")
        // }
        this._pxvalues = new Map();
        this._fitsheaderlist = new Array();
        this._radeclist = new Array();
        // if (fitsfilepath) {
        // 	return this.initFromFile(fitsfilepath);
        // } else if (pxsize !== null && pxsize !== undefined) {
        // 	this._hipsBaseURI = hipsBaseURI;
        // 	this.initFromPxsize(pxsize);
        // } else {
        // 	this._hipsBaseURI = hipsBaseURI;
        // 	this._pxsize = HiPSHelper.computePxSize(order);
        // 	this.initFromHiPSOrder(order);
        // }
    }
    // async initFromFile(fitsfilepath: string): Promise<FITSParsed> {
    // 	let fp = new FITSParser(fitsfilepath);
    // 	try {
    // 		const fits = await fp.loadFITS();
    // 		this._pxvalues[0] = fits.data;
    // 		this._fitsheaderlist[0] = fits.header;
    // 		let order = fits.header.get("ORDER");
    // 		this.init(order);
    // 		this._naxis1 = fits.header.get("NAXIS1");
    // 		this._naxis2 = fits.header.get("NAXIS2");
    // 		this._pixno = fits.header.get("NPIX");
    // 		this._xyGridProj = HiPSHelper.setupByTile(this._pixno, this._hp);
    // 		return fits;
    // 	} catch (err) {
    // 		console.log("[HiPSProjection] " + err);
    // 	}
    // }
    initFromFile(fitsfilepath) {
        return __awaiter(this, void 0, void 0, function* () {
            let fp = new FITSParser(fitsfilepath);
            try {
                const fits = yield fp.loadFITS();
                this._pxvalues.set(0, fits.data);
                this._fitsheaderlist[0] = fits.header;
                let order = fits.header.get("ORDER");
                this.init(order);
                this._naxis1 = fits.header.get("NAXIS1");
                this._naxis2 = fits.header.get("NAXIS2");
                this._pixno = fits.header.get("NPIX");
                this._xyGridProj = HiPSHelper.setupByTile(this._pixno, this._hp);
                return fits;
            }
            catch (err) {
                console.log("[HiPSProjection] " + err);
            }
        });
    }
    initFromHiPSLocationAndPxSize(baseUrl, pxsize) {
        this._hipsBaseURI = baseUrl;
        this._pxsize = pxsize;
        let order = HiPSHelper.computeHiPSOrder(pxsize);
        this.init(order);
    }
    initFromHiPSLocationAndOrder(baseUrl, order) {
        this._hipsBaseURI = baseUrl;
        this._pxsize = HiPSHelper.computePxSize(order);
        this.init(order);
    }
    init(order) {
        this._norder = order;
        this._nside = Math.pow(2, order);
        this._hp = new Healpix(this._nside);
    }
    // initFromPxsize(pxsize: number) {
    // 	this._pxsize = pxsize;
    // 	let hipsorder = HiPSHelper.computeHiPSOrder(pxsize);
    // 	this.initFromHiPSOrder(hipsorder);
    // }
    // initFromHiPSOrder(hipsorder: number) {
    // 	this._norder = hipsorder;
    // 	this._nside = 2 ** hipsorder;
    // 	this._hp = new Healpix(this._nside);
    // }
    prepareFITSHeader(fitsHeaderParams) {
        for (let header of this._fitsheaderlist) {
            header.addItemAtTheBeginning(new FITSHeaderItem("BITPIX", fitsHeaderParams.get("BITPIX")));
            header.addItemAtTheBeginning(new FITSHeaderItem("SIMPLE", fitsHeaderParams.get("SIMPLE")));
            if (fitsHeaderParams.get("BLANK") !== undefined) {
                header.addItem(new FITSHeaderItem("BLANK", fitsHeaderParams.get("BLANK")));
            }
            let bscale = 1.0;
            if (fitsHeaderParams.get("BSCALE") !== undefined) {
                bscale = fitsHeaderParams.get("BSCALE");
                header.addItem(new FITSHeaderItem("BSCALE", bscale));
            }
            let bzero = 0.0;
            if (fitsHeaderParams.get("BZERO") !== undefined) {
                bzero = fitsHeaderParams.get("BZERO");
                header.addItem(new FITSHeaderItem("BZERO", bzero));
            }
            header.addItem(new FITSHeaderItem("NAXIS", 2));
            header.addItem(new FITSHeaderItem("NAXIS1", HiPSHelper.DEFAULT_Naxis1_2));
            header.addItem(new FITSHeaderItem("NAXIS2", HiPSHelper.DEFAULT_Naxis1_2));
            header.addItem(new FITSHeaderItem("ORDER", this._norder));
            header.addItem(new FITSHeaderItem("CTYPE1", this._ctype1));
            header.addItem(new FITSHeaderItem("CTYPE2", this._ctype2));
            // header.addItem(new FITSHeaderItem("CRPIX1", HiPSHelper.DEFAULT_Naxis1_2/2)); // central/reference pixel i along naxis1
            // header.addItem(new FITSHeaderItem("CRPIX2", HiPSHelper.DEFAULT_Naxis1_2/2)); // central/reference pixel j along naxis2
            header.addItem(new FITSHeaderItem("ORIGIN", "WCSLight v.0.x"));
            header.addItem(new FITSHeaderItem("COMMENT", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar"));
        }
        return this._fitsheaderlist;
    }
    getFITSHeader() {
        return this._fitsheaderlist;
    }
    getCommonFitsHeaderParams() {
        return this._fh_common;
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
    getFITSFiles(inputPixelsList, destPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const fitsFilesGenerated = new Map();
            let promises = [];
            let tilesset = new Set();
            inputPixelsList.forEach((imgpx) => {
                tilesset.add(imgpx.tileno);
            });
            for (let hipstileno of tilesset) {
                let tileno = hipstileno;
                let dir = Math.floor(tileno / 10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
                let fitsurl = this._hipsBaseURI + "/Norder" + this._norder + "/Dir" + dir + "/Npix" + tileno + ".fits";
                let fp = new FITSParser(fitsurl);
                promises.push(fp.loadFITS().then((fits) => {
                    if (fits !== null) {
                        let pixno = fits.header.get("NPIX");
                        // FITSParser.writeFITS(fits.header, fits.data, destPath+"/Npix"+pixno+".fits");
                        // fitsFilesGenerated.set(destPath+"/Npix"+pixno+".fits",FITSParser.generateFITS(fits.header, fits.data) );
                        fitsFilesGenerated.set(destPath + "/Npix" + pixno + ".fits", fits);
                    }
                }));
            }
            yield Promise.all(promises);
            return fitsFilesGenerated;
        });
    }
    getPixValues(inputPixelsList) {
        return __awaiter(this, void 0, void 0, function* () {
            let tilesset = new Set();
            inputPixelsList.forEach((imgpx) => {
                tilesset.add(imgpx.tileno);
            });
            let pixcount = inputPixelsList.length;
            // var values = new Array(pixcount);
            let values = undefined;
            let fitsheaderlist = [];
            let promises = [];
            for (let hipstileno of tilesset) {
                let dir = Math.floor(hipstileno / 10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
                let fitsurl = this._hipsBaseURI + "/Norder" + this._norder + "/Dir" + dir + "/Npix" + hipstileno + ".fits";
                // console.log("Loading " + fitsurl);
                let fp = new FITSParser(fitsurl);
                promises.push(fp.loadFITS().then((fits) => {
                    if (fits === null) {
                        // console.error("tileno " + hipstileno + " data not loaded");
                        // console.log(fitsurl + " not found");
                        fitsheaderlist.push(undefined);
                    }
                    else {
                        let bytesXelem = Math.abs(fits.header.get("BITPIX") / 8);
                        let blankBytes = ParseUtils.convertBlankToBytes(fits.header.get("BLANK"), bytesXelem); // => ???????
                        if (values === undefined) {
                            values = new Uint8Array(pixcount * bytesXelem);
                        }
                        // console.log(fitsurl + " loaded");
                        fitsheaderlist.push(fits.header);
                        for (let p = 0; p < pixcount; p++) {
                            let imgpx = inputPixelsList[p];
                            if (imgpx.tileno === hipstileno) {
                                if (imgpx._j < HiPSHelper.DEFAULT_Naxis1_2 && imgpx._i < HiPSHelper.DEFAULT_Naxis1_2) {
                                    for (let b = 0; b < bytesXelem; b++) {
                                        values[p * bytesXelem + b] = fits.data[imgpx._j][imgpx._i * bytesXelem + b];
                                    }
                                }
                            }
                        }
                    }
                }));
            }
            yield Promise.all(promises);
            if (fitsheaderlist !== undefined) {
                this.prepareCommonHeader(fitsheaderlist);
            }
            return values;
        });
    }
    computeSquaredNaxes(d, ps) {
        // first aprroximation to be checked
        this._naxis1 = Math.ceil(d / ps);
        this._naxis2 = this._naxis1;
        this._pxsize = ps;
    }
    prepareCommonHeader(fitsheaderlist) {
        if (fitsheaderlist === undefined) {
            return;
        }
        if (!this._fh_common) {
            this._fh_common = new FITSHeader();
        }
        for (let i = 0; i < fitsheaderlist.length; i++) {
            let header = fitsheaderlist[i];
            if (header !== undefined) {
                for (let item of header.getItemList()) {
                    if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER"].includes(item.key)) {
                        if (!this._fh_common.getItemListOf(item.key)[0]) {
                            this._fh_common.addItem(new FITSHeaderItem(item.key, item.value));
                        }
                        else if (this._fh_common.getItemListOf(item.key)[0].value !== item.value) { // this should not happen 
                            throw new Error("Error parsing headers. " + item.key + " was " + this._fh_common.getItemListOf(item.key)[0] + " and now is " + item.value);
                        }
                    }
                }
            }
        }
    }
    // // TODO MOVE THIS IN AN UTILITY FILE
    // pixel2Physical(value, bzero, bscale) {
    // 	let pval = bzero + bscale * value;
    // 	return pval;
    // }
    setPxsValue(values, fitsHeaderParams) {
        // let vidx = 0; // <------ ERROR!!!!! pixel are not organized by tile!!!
        // let pxXTile = HiPSHelper.DEFAULT_Naxis1_2 * HiPSHelper.DEFAULT_Naxis1_2;
        let bytesXelem = Math.abs(fitsHeaderParams.get("BITPIX") / 8);
        let bscale = (fitsHeaderParams.get("BSCALE") !== undefined) ? fitsHeaderParams.get("BSCALE") : 1.0;
        let bzero = (fitsHeaderParams.get("BZERO") !== undefined) ? fitsHeaderParams.get("BZERO") : 0.0;
        if (bytesXelem === undefined || bscale === undefined || bzero === undefined) {
            throw new Error("BITPIX, BSCALE or BZERO are undefined");
        }
        // let minmaxmap = new Array();
        let minmaxmap = new Map();
        let nodata = new Map();
        this._tileslist.forEach((tileno) => {
            this._pxvalues.set(tileno, new Array(HiPSHelper.DEFAULT_Naxis1_2)); // <- bidimensional
            for (let row = 0; row < HiPSHelper.DEFAULT_Naxis1_2; row++) {
                if (this._pxvalues.has(tileno)) {
                    let p = this._pxvalues.get(tileno);
                    if (p !== undefined) {
                        p[row] = new Uint8Array(HiPSHelper.DEFAULT_Naxis1_2 * bytesXelem);
                    }
                }
            }
            minmaxmap.set("" + tileno + "", new Array(2));
            nodata.set("" + tileno + "", true);
        });
        let ra;
        let dec;
        let col;
        let row;
        for (let rdidx = 0; rdidx < this._radeclist.length; rdidx++) {
            [ra, dec] = this._radeclist[rdidx];
            let ac = fillAstro(ra, dec, NumberType.DEGREES);
            let sc = astroToSpherical(ac);
            let ptg = new Pointing(null, false, sc.thetaRad, sc.phiRad);
            let pixtileno = this._hp.ang2pix(ptg);
            let xyGridProj = HiPSHelper.setupByTile(pixtileno, this._hp);
            // let rarad = degToRad(ra);
            // let decrad = degToRad(dec);
            // TODO CHECK THIS POINT before it was with ra and dec in radians
            let xy = HiPSHelper.world2intermediate(ac);
            let ij = HiPSHelper.intermediate2pix(xy[0], xy[1], xyGridProj);
            col = ij[0];
            row = ij[1];
            for (let b = 0; b < bytesXelem; b++) {
                let byte = values[rdidx * bytesXelem + b];
                // this._pxvalues.get(pixtileno)[row][col * bytesXelem + b] = byte	// <- bidimensional
                if (this._pxvalues.has(pixtileno)) {
                    let p = this._pxvalues.get(pixtileno);
                    if (p !== undefined) {
                        p[row][col * bytesXelem + b] = byte; // <- bidimensional
                    }
                }
                if (nodata.get("" + pixtileno + "")) {
                    if (byte != 0) {
                        nodata.set("" + pixtileno + "", false);
                    }
                }
            }
            let min = minmaxmap.get("" + pixtileno + "")[0];
            let max = minmaxmap.get("" + pixtileno + "")[1];
            if (this._pxvalues.has(pixtileno)) {
                let p = this._pxvalues.get(pixtileno);
                if (p !== undefined) {
                    let valpixb = ParseUtils.extractPixelValue(0, p[row].slice(col * bytesXelem, col * bytesXelem + bytesXelem), fitsHeaderParams.get("BITPIX"));
                    let valphysical = bzero + bscale * valpixb;
                    if (valphysical < min || isNaN(min)) {
                        minmaxmap.get("" + pixtileno + "")[0] = valphysical;
                        // minmaxmap["" + pixtileno + ""][0] = valphysical;
                    }
                    else if (valphysical > max || isNaN(max)) {
                        minmaxmap.get("" + pixtileno + "")[1] = valphysical;
                        // minmaxmap["" + pixtileno + ""][1] = valphysical;
                    }
                }
            }
            // let valpixb = ParseUtils.extractPixelValue(0, this._pxvalues.get(pixtileno)[row].slice(col * bytesXelem, col * bytesXelem + bytesXelem), fitsHeaderParams.get("BITPIX"));
            // let valphysical = bzero + bscale * valpixb;
            // if (valphysical < min || isNaN(min)) {
            // 	minmaxmap.get("" + pixtileno + "")[0] = valphysical;
            // 	// minmaxmap["" + pixtileno + ""][0] = valphysical;
            // } else if (valphysical > max || isNaN(max)) {
            // 	minmaxmap.get("" + pixtileno + "")[1] = valphysical;
            // 	// minmaxmap["" + pixtileno + ""][1] = valphysical;
            // }
        }
        // Object.keys(this._pxvalues.keys()).forEach((tileno) => {
        const fhKeys = Array.from(this._pxvalues.keys());
        fhKeys.forEach((tileno) => {
            if (nodata.get("" + tileno + "") == false) { // there are data
                // tileno = parseInt(tileno);
                let header = new FITSHeader();
                header.set("NPIX", tileno);
                // TODO CONVERT minval and maxval to physical values!
                // header.addItem(new FITSHeaderItem("DATAMIN", minmaxmap["" + tileno + ""][0]));
                // header.addItem(new FITSHeaderItem("DATAMAX", minmaxmap["" + tileno + ""][1]));
                header.addItem(new FITSHeaderItem("DATAMIN", minmaxmap.get("" + tileno + "")[0]));
                header.addItem(new FITSHeaderItem("DATAMAX", minmaxmap.get("" + tileno + "")[1]));
                header.addItem(new FITSHeaderItem("NPIX", tileno));
                let vec3 = this._hp.pix2vec(tileno);
                let ptg = new Pointing(vec3);
                let crval1 = radToDeg(ptg.phi);
                let crval2 = 90 - radToDeg(ptg.theta);
                header.addItem(new FITSHeaderItem("CRVAL1", crval1));
                header.addItem(new FITSHeaderItem("CRVAL2", crval2));
                this._fitsheaderlist.push(header);
            }
            else { // no data
                // this._pxvalues.delete(parseInt(tileno));
                this._pxvalues.delete(tileno);
                // delete this._pxvalues["" + tileno + ""];
            }
        });
        this.prepareFITSHeader(fitsHeaderParams);
        return this._pxvalues;
    }
    getImageRADecList(center, radiusDeg) {
        let ptg = new Pointing(null, false, center.spherical.thetaRad, center.spherical.phiRad);
        let radius_rad = degToRad(radiusDeg);
        // with fact 8 the original Java code starts returning the the ptg pixel. with my JS porting only from fact 16
        let rangeset = this._hp.queryDiscInclusive(ptg, radius_rad, 4); // <= check it 
        this._tileslist = [];
        for (let p = 0; p < rangeset.r.length; p++) {
            if (!this._tileslist.includes(rangeset.r[p]) && rangeset.r[p] != 0) {
                this._tileslist.push(rangeset.r[p]);
            }
        }
        let cpix = this._hp.ang2pix(ptg);
        if (!this._tileslist.includes(cpix)) {
            this._tileslist.push(cpix);
        }
        let minra = center.astro.raDeg - radiusDeg;
        let maxra = center.astro.raDeg + radiusDeg;
        let mindec = center.astro.decDeg - radiusDeg;
        let maxdec = center.astro.decDeg + radiusDeg;
        this._tileslist.forEach((tileno) => {
            this._xyGridProj = HiPSHelper.setupByTile(tileno, this._hp);
            for (let j = 0; j < HiPSHelper.DEFAULT_Naxis1_2; j++) {
                for (let i = 0; i < HiPSHelper.DEFAULT_Naxis1_2; i++) {
                    let p = this.pix2world(i, j);
                    if (p.astro.raDeg < minra || p.astro.raDeg > maxra ||
                        p.astro.decDeg < mindec || p.astro.decDeg > maxdec) {
                        continue;
                    }
                    this._radeclist.push([p.astro.raDeg, p.astro.decDeg]);
                }
            }
        });
        return this._radeclist;
    }
    // getImageRADecList(center: Point, radiusDeg: number, pxsize: number): Promise<any> {
    // 	let cRADecDeg = center.astro;
    // 	this._radeclist = [];
    // 	let promise = new Promise((resolve, reject) => {
    // 		let ptg = new Pointing(null, false, center.spherical.thetaRad, center.spherical.phiRad);
    // 		let radius_rad = degToRad(radiusDeg);
    // 		// with fact 8 the original Java code starts returning the the ptg pixel. with my JS porting only from fact 16
    // 		let rangeset = this._hp.queryDiscInclusive(ptg, radius_rad, 4); // <= check it 
    // 		this._tileslist = [];
    // 		for (let p = 0; p < rangeset.r.length; p++) {
    // 			if (!this._tileslist.includes(rangeset.r[p]) && rangeset.r[p] != 0) {
    // 				this._tileslist.push(rangeset.r[p]);
    // 			}
    // 		}
    // 		let cpix = this._hp.ang2pix(ptg);
    // 		if (!this._tileslist.includes(cpix)) {
    // 			this._tileslist.push(cpix);
    // 		}
    // 		let minra = center.raDeg - radiusDeg;
    // 		let maxra = center.raDeg + radiusDeg;
    // 		let mindec = center.decDeg - radiusDeg;
    // 		let maxdec = center.decDeg + radiusDeg;
    // 		this._tileslist.forEach((tileno: number) => {
    // 			this._xyGridProj = HiPSHelper.setupByTile(tileno, this._hp);
    // 			for (let j = 0; j < HiPSHelper.DEFAULT_Naxis1_2; j++) {
    // 				for (let i = 0; i < HiPSHelper.DEFAULT_Naxis1_2; i++) {
    // 					let p = this.pix2world(i, j);
    // 					if (p.astro.raDeg < minra || p.astro.raDeg > maxra ||
    // 						p.astro.decDeg < mindec || p.astro.decDeg > maxdec) {
    // 						continue;
    // 					}
    // 					this._radeclist.push([p.astro.raDeg, p.astro.decDeg]);
    // 				}
    // 			}
    // 		});
    // 		resolve(this._radeclist);
    // 	});
    // 	return promise;
    // }
    pix2world(i, j) {
        let xy = HiPSHelper.pix2intermediate(i, j, this._xyGridProj, this._naxis1, this._naxis2);
        // TODO CHECK BELOW before it was only which is supposed to be wrong since intermediate2world returns SphericalCoords, not AstroCoords
        /**
        let raDecDeg = HiPSHelper.intermediate2world(xy[0], xy[1]);
        if (raDecDeg[0] > 360){
            raDecDeg[0] -= 360;
        }
        return raDecDeg;
        */
        let p = HiPSHelper.intermediate2world(xy[0], xy[1]);
        // if (p.spherical.phiDeg > 360){
        // 	sc.phiDeg -= 360;
        // }
        return p;
    }
    // world2pix(radeclist: number[][]): Promise<ImagePixel[]> {
    // 	let promise = new Promise<ImagePixel[]>((resolve, reject) => {
    // 		// let imgpxlist = new ImagePixel[radeclist.length];
    // 		let imgpxlist = [];
    // 		let tileno: number;
    // 		let prevTileno = undefined;
    // 		// let k = 0;
    // 		radeclist.forEach(([ra, dec]) => {
    // 			let p = new Point(CoordsType.ASTRO, NumberType.DEGREES, ra, dec);
    // 			// let phiTheta_rad = HiPSHelper.astroDegToSphericalRad(ra, dec);
    // 			let ptg = new Pointing(null, false, p.spherical.thetaRad, p.spherical.phiRad);
    // 			tileno = this._hp.ang2pix(ptg);
    // 			if (prevTileno !== tileno || prevTileno === undefined) {
    // 				this._xyGridProj = HiPSHelper.setupByTile(tileno, this._hp);
    // 				prevTileno = tileno;
    // 			}
    // 			// let rarad =  HiPSHelper.degToRad(ra);
    // 			// let decrad = HiPSHelper.degToRad(dec);
    // 			let xy = HiPSHelper.world2intermediate(p.spherical);
    // 			let ij = HiPSHelper.intermediate2pix(xy[0], xy[1], this._xyGridProj);
    // 			imgpxlist.push(new ImagePixel(ij[0], ij[1], tileno));
    // 			// k++;
    // 		});
    // 		return imgpxlist;
    // 		// resolve(imgpxlist);
    // 	});
    // 	return promise;
    // }
    world2pix(radeclist) {
        // let imgpxlist = new ImagePixel[radeclist.length];
        let imgpxlist = [];
        let tileno;
        let prevTileno = undefined;
        // let k = 0;
        radeclist.forEach(([ra, dec]) => {
            let p = new Point(CoordsType.ASTRO, NumberType.DEGREES, ra, dec);
            // let phiTheta_rad = HiPSHelper.astroDegToSphericalRad(ra, dec);
            let ptg = new Pointing(null, false, p.spherical.thetaRad, p.spherical.phiRad);
            tileno = this._hp.ang2pix(ptg);
            if (prevTileno !== tileno || prevTileno === undefined) {
                this._xyGridProj = HiPSHelper.setupByTile(tileno, this._hp);
                prevTileno = tileno;
            }
            // let rarad =  HiPSHelper.degToRad(ra);
            // let decrad = HiPSHelper.degToRad(dec);
            let xy = HiPSHelper.world2intermediate(p.astro);
            let ij = HiPSHelper.intermediate2pix(xy[0], xy[1], this._xyGridProj);
            imgpxlist.push(new ImagePixel(ij[0], ij[1], tileno));
        });
        return imgpxlist;
    }
}
//# sourceMappingURL=HiPSProjection.js.map