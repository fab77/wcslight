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
import { Healpix } from "healpixjs";
import { Pointing } from "healpixjs";
import { AbstractProjection } from './AbstractProjection.js';
import { HiPSHelper } from './HiPSHelper.js';
import { ImagePixel } from '../model/ImagePixel.js';
import { astroToSpherical, degToRad, fillAstro, radToDeg } from '../model/Utils.js';
import { Point } from '../model/Point.js';
import { CoordsType } from '../model/CoordsType.js';
import { NumberType } from '../model/NumberType.js';
export class HiPSProjection extends AbstractProjection {
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
        super("'RA---HPX'", "'DEC--HPX'");
        // _naxis1!: number;
        // _naxis2!: number;
        this._isGalactic = false;
        this._fitsUsed = [];
        this._wcsname = "HPX"; // TODO check WCS standard
        // this._ctype1 = "RA---HPX";
        // this._ctype2 = "DEC--HPX";
        this._pxvalues = new Map();
        this._fitsheaderlist = new Array();
        this._radeclist = new Array();
    }
    parsePropertiesFile(baseUrl) {
        const _super = Object.create(null, {
            naxis1: { get: () => super.naxis1, set: v => super.naxis1 = v },
            naxis2: { get: () => super.naxis2, set: v => super.naxis2 = v }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const fp = new FITSParser(null);
            const promise = fp.getFile(baseUrl + "/properties").then((propFile) => {
                let prop;
                if (propFile instanceof ArrayBuffer) {
                    const textDecoder = new TextDecoder("iso-8859-1");
                    prop = textDecoder.decode(new Uint8Array(propFile));
                }
                else {
                    prop = propFile.toString('utf8');
                }
                /**
                    HiPS – Hierarchical Progressive Survey
                    Version 1.0
                    IVOA Proposed Recommendation
                    3rd April 2017
                    https://www.ivoa.net/documents/HiPS/20170403/PR-HIPS-1.0-20170403.pdf
                 */
                const txtArr = prop.split('\n');
                this._HIPS_TILE_WIDTH = 512;
                for (let line of txtArr) {
                    if (!line.includes("=")) {
                        continue;
                    }
                    const tokens = line.split("=");
                    if (tokens[1] === undefined) {
                        continue;
                    }
                    const key = tokens[0].trim();
                    const val = tokens[1].trim();
                    if (key == "hips_order") {
                        this._HIPS_MAX_ORDER = parseInt(val);
                        console.log("hips_order " + this._HIPS_MAX_ORDER);
                    }
                    else if (key == "hips_tile_width") {
                        this._HIPS_TILE_WIDTH = parseInt(val);
                        _super.naxis1 = this._HIPS_TILE_WIDTH;
                        _super.naxis2 = this._HIPS_TILE_WIDTH;
                        console.log("hips_tile_width " + this._HIPS_TILE_WIDTH);
                    }
                    else if (key == "hips_frame" && val == "galactic") {
                        this._isGalactic = true;
                    }
                }
                return propFile;
            });
            yield promise;
            return promise;
        });
    }
    initFromFile(fitsfilepath) {
        const _super = Object.create(null, {
            naxis1: { get: () => super.naxis1, set: v => super.naxis1 = v },
            naxis2: { get: () => super.naxis2, set: v => super.naxis2 = v }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let fp = new FITSParser(fitsfilepath);
            let promise = fp.loadFITS().then(fits => {
                this._pxvalues.set(0, fits.data);
                this._fitsheaderlist[0] = fits.header;
                let order = fits.header.get("ORDER");
                this.init(order);
                _super.naxis1 = fits.header.get("NAXIS1");
                _super.naxis2 = fits.header.get("NAXIS2");
                this._HIPS_TILE_WIDTH = _super.naxis1;
                this._pixno = fits.header.get("NPIX");
                this._xyGridProj = HiPSHelper.setupByTile(this._pixno, this._hp);
                return fits;
            });
            yield promise;
            return promise;
        });
    }
    initFromHiPSLocationAndPxSize(baseUrl, pxsize) {
        const _super = Object.create(null, {
            pxsize: { get: () => super.pxsize, set: v => super.pxsize = v }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this._hipsBaseURI = baseUrl;
            _super.pxsize = pxsize;
            if (this._HIPS_TILE_WIDTH === undefined) {
                yield this.parsePropertiesFile(baseUrl);
            }
            // let order = HiPSHelper.computeHiPSOrder(pxsize, this._HIPS_TILE_WIDTH);
            // let order2 = HiPSHelper.computeHiPSOrder2(pxsize, this._HIPS_TILE_WIDTH);
            let order = HiPSHelper.computeOrder(pxsize, this._HIPS_TILE_WIDTH);
            if (order > this._HIPS_MAX_ORDER) {
                order = this._HIPS_MAX_ORDER;
            }
            this.init(order);
        });
    }
    initFromHiPSLocationAndOrder(baseUrl, order) {
        const _super = Object.create(null, {
            pxsize: { get: () => super.pxsize, set: v => super.pxsize = v }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this._hipsBaseURI = baseUrl;
            if (this._HIPS_TILE_WIDTH === undefined) {
                yield this.parsePropertiesFile(baseUrl);
            }
            if (order > this._HIPS_MAX_ORDER) {
                order = this._HIPS_MAX_ORDER;
            }
            _super.pxsize = HiPSHelper.computePxSize(order, this._HIPS_TILE_WIDTH);
            this.init(order);
        });
    }
    init(order) {
        this._norder = order;
        this._nside = Math.pow(2, order);
        this._hp = new Healpix(this._nside);
    }
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
            header.addItem(new FITSHeaderItem("CTYPE1", super.ctype1));
            header.addItem(new FITSHeaderItem("CTYPE2", super.ctype2));
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
                        let pixno = (fits.header.get("NPIX") !== undefined) ? fits.header.get("NPIX") : tileno;
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
    get fitsUsed() {
        return this._fitsUsed;
    }
    getPixValues(inputPixelsList) {
        return __awaiter(this, void 0, void 0, function* () {
            let tilesset = new Set();
            inputPixelsList.forEach((imgpx) => {
                tilesset.add(imgpx.tileno);
            });
            let pixcount = inputPixelsList.length;
            let values = undefined;
            let fitsheaderlist = [];
            let promises = [];
            let self = this;
            for (let hipstileno of tilesset) {
                let dir = Math.floor(hipstileno / 10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
                let fitsurl = this._hipsBaseURI + "/Norder" + this._norder + "/Dir" + dir + "/Npix" + hipstileno + ".fits";
                console.log(`Identified source file ${fitsurl}`);
                let fp = new FITSParser(fitsurl);
                promises.push(fp.loadFITS().then((fits) => {
                    if (fits === null) {
                        fitsheaderlist.push(undefined);
                    }
                    else {
                        self._fitsUsed.push(fitsurl);
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
                                // if (imgpx._j < HiPSHelper.DEFAULT_Naxis1_2 && imgpx._i < HiPSHelper.DEFAULT_Naxis1_2) {
                                if (imgpx._j < fits.header.get("NAXIS1") && imgpx._i < fits.header.get("NAXIS2")) {
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
            // this._pxvalues.set(tileno, new Array(HiPSHelper.DEFAULT_Naxis1_2));  // <- bidimensional
            // for (let row = 0; row < HiPSHelper.DEFAULT_Naxis1_2; row++) {
            this._pxvalues.set(tileno, new Array(this._HIPS_TILE_WIDTH)); // <- bidimensional
            for (let row = 0; row < this._HIPS_TILE_WIDTH; row++) {
                if (this._pxvalues.has(tileno)) {
                    let p = this._pxvalues.get(tileno);
                    if (p !== undefined) {
                        // p[row] = new Uint8Array(HiPSHelper.DEFAULT_Naxis1_2 * bytesXelem);
                        p[row] = new Uint8Array(this._HIPS_TILE_WIDTH * bytesXelem);
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
            if (this._HIPS_TILE_WIDTH === undefined) {
                throw new Error("this._HIPS_TILE_WIDTH undefined");
            }
            let ij = HiPSHelper.intermediate2pix(xy[0], xy[1], xyGridProj, this._HIPS_TILE_WIDTH);
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
                    }
                    else if (valphysical > max || isNaN(max)) {
                        minmaxmap.get("" + pixtileno + "")[1] = valphysical;
                    }
                }
            }
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
            // for (let j = 0; j < HiPSHelper.DEFAULT_Naxis1_2; j++) {
            // 	for (let i = 0; i < HiPSHelper.DEFAULT_Naxis1_2; i++) {
            for (let j = 0; j < this._HIPS_TILE_WIDTH; j++) {
                for (let i = 0; i < this._HIPS_TILE_WIDTH; i++) {
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
    pix2world(i, j) {
        let xy = HiPSHelper.pix2intermediate(i, j, this._xyGridProj, super.naxis1, super.naxis2);
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
    // conversion taken from https://astrophysicsandpython.com/2022/03/15/html-js-equatorial-to-galactic-coordinates/
    convertToGalactic(radeclist) {
        let finalradeclist = [];
        const deg2rad = Math.PI / 180;
        const rad2deg = 180 / Math.PI;
        const l_NCP = deg2rad * 122.930;
        const d_NGP = deg2rad * 27.1284;
        const a_NGP = deg2rad * 192.8595;
        radeclist.forEach(([ra, dec]) => {
            const ra_rad = deg2rad * ra;
            const dec_rad = deg2rad * dec;
            // sin(b)
            const sin_b = Math.sin(d_NGP) * Math.sin(dec_rad) +
                Math.cos(d_NGP) * Math.cos(dec_rad) * Math.cos(ra_rad - a_NGP);
            const b = Math.asin(sin_b);
            const b_deg = b * rad2deg;
            // l_NCP - l
            const lNCP_minus_l = Math.atan((Math.cos(dec_rad) * Math.sin(ra_rad - a_NGP)) /
                (Math.sin(dec_rad) * Math.cos(d_NGP) - Math.cos(dec_rad) * Math.sin(d_NGP) * Math.cos(ra_rad - a_NGP)));
            const l = l_NCP - lNCP_minus_l;
            const l_deg = l * rad2deg;
            finalradeclist.push([l_deg, b_deg]);
        });
        return finalradeclist;
    }
    world2pix(radeclist) {
        // let imgpxlist = new ImagePixel[radeclist.length];
        let imgpxlist = [];
        let tileno;
        let prevTileno = undefined;
        // let k = 0;
        /*
            if HiPS in galactic => convert the full list of (RA, Dec) to Galactic  (l, b)
        */
        if (this._isGalactic) {
            radeclist = this.convertToGalactic(radeclist);
        }
        radeclist.forEach(([ra, dec]) => {
            const p = new Point(CoordsType.ASTRO, NumberType.DEGREES, ra, dec);
            // let phiTheta_rad = HiPSHelper.astroDegToSphericalRad(ra, dec);
            const ptg = new Pointing(null, false, p.spherical.thetaRad, p.spherical.phiRad);
            tileno = this._hp.ang2pix(ptg);
            if (prevTileno !== tileno || prevTileno === undefined) {
                this._xyGridProj = HiPSHelper.setupByTile(tileno, this._hp);
                prevTileno = tileno;
            }
            // let rarad =  HiPSHelper.degToRad(ra);
            // let decrad = HiPSHelper.degToRad(dec);
            const xy = HiPSHelper.world2intermediate(p.astro);
            if (this._HIPS_TILE_WIDTH === undefined) {
                throw new Error("this._HIPS_TILE_WIDTH undefined");
            }
            const ij = HiPSHelper.intermediate2pix(xy[0], xy[1], this._xyGridProj, this._HIPS_TILE_WIDTH);
            imgpxlist.push(new ImagePixel(ij[0], ij[1], tileno));
        });
        return imgpxlist;
    }
}
//# sourceMappingURL=HiPSProjection.js.map