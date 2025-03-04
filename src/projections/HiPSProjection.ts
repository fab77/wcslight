"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */


import { FITSParser } from 'jsfitsio';
import { FITSHeaderManager } from 'jsfitsio';
import { FITSHeaderItem } from 'jsfitsio';
import { FITSParsed } from 'jsfitsio';
import { ParseUtils } from 'jsfitsio';

import { Healpix } from "healpixjs";
import { Pointing } from "healpixjs";

import { AbstractProjection } from './AbstractProjection.js';
import { HEALPixXYSpace } from '../model/HEALPixXYSpace.js';

import { HiPSHelper } from './HiPSHelper.js';


import { ImagePixel } from '../model/ImagePixel.js';
import { astroToSpherical, degToRad, fillAstro, radToDeg } from '../model/Utils.js';
import { Point } from '../model/Point.js';
import { CoordsType } from '../model/CoordsType.js';
import { NumberType } from '../model/NumberType.js';
import { exit } from 'process';
import { INSPECT_MAX_BYTES } from 'buffer';
import { FITS } from '../model/FITS.js';



export class HiPSProjection extends AbstractProjection {

	_isGalactic: boolean = false;
	_pixno!: number;
	_tileslist!: number[];
	_hp!: Healpix;
	_fh_common!: FITSHeaderManager;
	_wcsname: string;
	_hipsBaseURI!: string;
	_fitsheaderlist: FITSHeaderManager[];
	_pxvalues: Map<number, Array<Uint8Array>>;
	_xyGridProj!: HEALPixXYSpace;
	_norder!: number;
	_nside!: number;
	_radeclist: Array<[number, number]>;
	_HIPS_TILE_WIDTH: number = 512;
	_fitsUsed: String[] = [];
	_HIPS_MAX_ORDER: number;

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
		super("'RA---HPX'", "'DEC--HPX'")
		this._wcsname = "HPX"; // TODO check WCS standard
		// this._ctype1 = "RA---HPX";
		// this._ctype2 = "DEC--HPX";

		this._pxvalues = new Map<number, Array<Uint8Array>>();
		this._fitsheaderlist = new Array<FITSHeaderManager>();
		this._radeclist = new Array<[number, number]>();

	}

	async parsePropertiesFile(baseUrl: string): Promise<any> {

		const propFile = await fetch(baseUrl + "/properties")
		// const fp = new FITSParser(null);

		// const promise = fp.getFile(baseUrl + "/properties").then((propFile: ArrayBuffer | Buffer) => {
		let prop: string;
		if (propFile instanceof ArrayBuffer) {
			const textDecoder = new TextDecoder("iso-8859-1");
			prop = textDecoder.decode(new Uint8Array(propFile));
		} else {
			// prop = propFile.toString('utf8');
			prop = propFile.toString();
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
			const key = tokens[0].trim()
			const val = tokens[1].trim()

			if (key == "hips_order") {
				this._HIPS_MAX_ORDER = parseInt(val);
				console.log("hips_order " + this._HIPS_MAX_ORDER)
			} else if (key == "hips_tile_width") {
				this._HIPS_TILE_WIDTH = parseInt(val);
				super.naxis1 = this._HIPS_TILE_WIDTH;
				super.naxis2 = this._HIPS_TILE_WIDTH;
				console.log("hips_tile_width " + this._HIPS_TILE_WIDTH)
			} else if (key == "hips_frame" && val == "galactic") {
				this._isGalactic = true;

			}
		}
		return propFile;
		// });

		// await promise;
		// return promise;
	}

	async initFromFile(fitsfilepath: string): Promise<FITSParsed | null> {
		const fits = await FITSParser.loadFITS(fitsfilepath)
		if (fits == null) {
			return null
		}
		this._pxvalues.set(0, fits.data);
		this._fitsheaderlist[0] = fits.header;

		const order = fits.header.findById("ORDER");
		const naxis1 = fits.header.findById("NAXIS1");
		const naxis2 = fits.header.findById("NAXIS2");
		const pixno = fits.header.findById("NPIX");

		if (!order?.value || !naxis1?.value || !naxis2?.value || !pixno?.value) {
			return null
		}
		this.init(Number(order.value));
		this._pixno = Number(pixno.value)
		super.naxis1 = Number(naxis1)
		super.naxis2 = Number(naxis2)
		this._HIPS_TILE_WIDTH = super.naxis1;

		this._xyGridProj = HiPSHelper.setupByTile(this._pixno, this._hp);
		return fits;
	}



	async initFromHiPSLocationAndPxSize(baseUrl: string, pxsize: number) {
		this._hipsBaseURI = baseUrl;
		super.pxsize = pxsize;
		if (this._HIPS_TILE_WIDTH === undefined) {
			await this.parsePropertiesFile(baseUrl);
		}
		// let order = HiPSHelper.computeHiPSOrder(pxsize, this._HIPS_TILE_WIDTH);
		// let order2 = HiPSHelper.computeHiPSOrder2(pxsize, this._HIPS_TILE_WIDTH);
		let order = HiPSHelper.computeOrder(pxsize, this._HIPS_TILE_WIDTH);
		if (order > this._HIPS_MAX_ORDER) {
			order = this._HIPS_MAX_ORDER
		}
		this.init(order);
	}

	async initFromHiPSLocationAndOrder(baseUrl: string, order: number) {
		this._hipsBaseURI = baseUrl;
		if (this._HIPS_TILE_WIDTH === undefined) {
			await this.parsePropertiesFile(baseUrl);
		}
		if (order > this._HIPS_MAX_ORDER) {
			order = this._HIPS_MAX_ORDER
		}
		super.pxsize = HiPSHelper.computePxSize(order, this._HIPS_TILE_WIDTH);
		this.init(order);
	}

	init(order: number) {
		this._norder = order;
		this._nside = 2 ** order;
		this._hp = new Healpix(this._nside);
	}

	prepareFITSHeader(fitsHeaderParams: FITSHeaderManager): FITSHeaderManager[] {

		// validation
		const fitsHeaderItem_bitpix = fitsHeaderParams.findById("BITPIX")
		const fitsHeaderItem_simple = fitsHeaderParams.findById("SIMPLE")
		if (!fitsHeaderItem_bitpix?.value || !fitsHeaderItem_simple?.value) {
			return []
		}

		for (let header of this._fitsheaderlist) {

			header.insert(new FITSHeaderItem("BITPIX", fitsHeaderItem_bitpix.value, ""));
			header.insert(new FITSHeaderItem("SIMPLE", fitsHeaderItem_simple.value, ""));

			const fitsHeaderItem_blank = fitsHeaderParams.findById("BLANK")
			if (fitsHeaderItem_blank !== null) {
				header.insert(new FITSHeaderItem("BLANK", fitsHeaderItem_blank.value, ""));
			}

			let bscale = 1.0;
			if (fitsHeaderParams.findById("BSCALE") !== null) {
				bscale = Number(fitsHeaderParams.findById("BSCALE")?.value)
			}
			header.insert(new FITSHeaderItem("BSCALE", bscale, ""));


			let bzero = 0.0;
			if (fitsHeaderParams.findById("BZERO") !== null) {
				bzero = Number(fitsHeaderParams.findById("BZERO")?.value)
			}
			header.insert(new FITSHeaderItem("BZERO", bzero, ""));

			header.insert(new FITSHeaderItem("NAXIS", 2, ""));
			header.insert(new FITSHeaderItem("NAXIS1", HiPSHelper.DEFAULT_Naxis1_2, ""));
			header.insert(new FITSHeaderItem("NAXIS2", HiPSHelper.DEFAULT_Naxis1_2, ""));

			header.insert(new FITSHeaderItem("ORDER", this._norder, ""));

			header.insert(new FITSHeaderItem("CTYPE1", super.ctype1, ""));
			header.insert(new FITSHeaderItem("CTYPE2", super.ctype2, ""));

			// header.insert(new FITSHeaderItem("CRPIX1", HiPSHelper.DEFAULT_Naxis1_2/2)); // central/reference pixel i along naxis1
			// header.insert(new FITSHeaderItem("CRPIX2", HiPSHelper.DEFAULT_Naxis1_2/2)); // central/reference pixel j along naxis2

			header.insert(new FITSHeaderItem("ORIGIN", "WCSLight v.0.x", ""));
			header.insert(new FITSHeaderItem("COMMENT", "", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar"));

		}
		return this._fitsheaderlist;
	}


	getFITSHeader(): FITSHeaderManager[] {
		return this._fitsheaderlist;
	}

	getCommonFitsHeaderParams(): FITSHeaderManager {
		return this._fh_common;
	}

	extractPhysicalValues(fits: FITSParsed): number[][] {

		const bzero = Number(fits.header.findById("BZERO")?.value)
		const bscale = Number(fits.header.findById("BSCALE")?.value)
		const naxis1 = Number(fits.header.findById("NAXIS1")?.value)
		const naxis2 = Number(fits.header.findById("NAXIS2")?.value)
		const bitpix = Number(fits.header.findById("BITPIX")?.value)
		const blank = Number(fits.header.findById("BLANK")?.value)
		// validation
		if (!bzero || !bscale || !naxis1 || !naxis2 || !bitpix || !blank) {
			return []
		}


		const bytesXelem = Math.abs(bitpix / 8);
		const blankBytes = ParseUtils.convertBlankToBytes(blank, bytesXelem); // TODO => ??????? Im not using it. it should be used!
		let physicalvalues: number[][] = new Array<number[]>(naxis2);

		for (let n2 = 0; n2 < naxis2; n2++) {
			physicalvalues[n2] = new Array<number>(naxis1);
			for (let n1 = 0; n1 < naxis1; n1++) {
				const pixval = ParseUtils.extractPixelValue(0, fits.data[n2].slice(n1 * bytesXelem, (n1 + 1) * bytesXelem), bitpix);
				if (pixval == null) {
					console.error("pixel value is null")
					return []
				}
				const physicalVal = bzero + bscale * pixval;
				physicalvalues[n2][n1] = physicalVal;
			}
		}
		return physicalvalues;

	}

	async getFITSFiles(inputPixelsList: ImagePixel[], destPath: string): Promise<Map<string, FITSParsed>> {

		const fitsFilesGenerated = new Map<string, FITSParsed>();
		let promises = [];
		let tilesset = new Set<number>();
		inputPixelsList.forEach((imgpx) => {
			tilesset.add(imgpx.tileno);
		});
		for (let hipstileno of tilesset) {
			let tileno = hipstileno;
			let dir = Math.floor(tileno / 10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
			let fitsurl = this._hipsBaseURI + "/Norder" + this._norder + "/Dir" + dir + "/Npix" + tileno + ".fits";

			promises.push(FITSParser.loadFITS(fitsurl).then((fits) => {
				if (fits !== null) {
					const pixno = fits.header.findById("NPIX")?.value
					console.log(`requested tile number ${tileno}, received fits npix ${pixno}`)
					fitsFilesGenerated.set(destPath + "/Npix" + tileno + ".fits", fits);
				}
			}));
		}
		await Promise.all(promises);
		return fitsFilesGenerated;
	}


	get fitsUsed(): String[] {
		return this._fitsUsed;
	}

	async getPixValues(inputPixelsList: ImagePixel[]): Promise<Uint8Array | undefined> {

		let tilesset = new Set<number>();
		inputPixelsList.forEach((imgpx) => {
			tilesset.add(imgpx.tileno);
		});

		let pixcount = inputPixelsList.length;
		let values: Uint8Array = new Uint8Array();
		let fitsheaderlist: FITSHeaderManager[] = [];
		let promises = [];

		let self = this;
		for (let hipstileno of tilesset) {

			const dir = Math.floor(hipstileno / 10000) * 10000; // as per HiPS recomendation REC-HIPS-1.0-20170519 
			const fitsurl = this._hipsBaseURI + "/Norder" + this._norder + "/Dir" + dir + "/Npix" + hipstileno + ".fits";
			console.log(`Identified source file ${fitsurl}`)

			promises.push(FITSParser.loadFITS(fitsurl).then((fits) => {

				if (fits === null) {
					// TODO REVIEW THIS
					fitsheaderlist.push(new FITSHeaderManager());
				} else {
					self._fitsUsed.push(fitsurl);

					const bitpix = Number(fits.header.findById("BITPIX")?.value)
					const naxis1 = Number(fits.header.findById("NAXIS1")?.value)
					const naxis2 = Number(fits.header.findById("NAXIS2")?.value)
					if (!bitpix || !naxis1 || ! naxis2) {
						console.error(`bitpix: ${bitpix}, naxis1: ${naxis1}, naxis2: ${naxis2} for fits file ${fitsurl}` )
						return
					}

					const bytesXelem = Math.abs(bitpix / 8);
					
					if (values.length == 0) {
						values = new Uint8Array(pixcount * bytesXelem);
					}

					// console.log(fitsurl + " loaded");
					fitsheaderlist.push(fits.header);

					for (let p = 0; p < pixcount; p++) {
						let imgpx = inputPixelsList[p];

						if (imgpx.tileno === hipstileno) {
							if (imgpx._j < naxis1 && imgpx._i < naxis2) {
								for (let b = 0; b < bytesXelem; b++) {
									values[p * bytesXelem + b] = fits.data[imgpx._j][imgpx._i * bytesXelem + b];
								}
							}
						}
					}
				}




			}));
		}
		await Promise.all(promises);
		this.prepareCommonHeader(fitsheaderlist);
		

		return values;
	}

	prepareCommonHeader(fitsheaderlist: FITSHeaderManager[]): void {
		if (fitsheaderlist === undefined) {
			return;
		}
		if (!this._fh_common) {
			this._fh_common = new FITSHeaderManager();
		}

		for (let i = 0; i < fitsheaderlist.length; i++) {
			let header = fitsheaderlist[i];
			if (header !== undefined) {

				for (let item of header.getItems()) {
					if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER"].includes(item.key)) {
						if (!this._fh_common.findById(item.key)) {
							this._fh_common.insert(new FITSHeaderItem(item.key, item.value, ""));
						} else if (this._fh_common.findById(item.key)?.value !== item.value) { // TODO this should never happen 
							throw new Error("Error parsing headers. " + item.key + " was " + this._fh_common.findById(item.key) + " and now is " + item.value);
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

	setPxsValue(values: Uint8Array, fitsHeaderParams: FITSHeaderManager): Map<number, Array<Uint8Array>> {

		// let vidx = 0; // <------ ERROR!!!!! pixel are not organized by tile!!!

		// let pxXTile = HiPSHelper.DEFAULT_Naxis1_2 * HiPSHelper.DEFAULT_Naxis1_2;

		const bitpix = Number(fitsHeaderParams.findById("BITPIX")?.value)
		let bscale = Number(fitsHeaderParams.findById("BSCALE")?.value)
		let bzero = Number(fitsHeaderParams.findById("BZERO")?.value)

		if (!bitpix){
			return new Map()
		}
		let bytesXelem = Math.abs(bitpix / 8);
		
		if (!bscale) {
			bscale = 1.0
		}
		if (!bzero) {
			bzero = 0.0
		}
		
		if (bytesXelem === undefined || bscale === undefined || bzero === undefined) {
			throw new Error("BITPIX, BSCALE or BZERO are undefined");
		}


		// let minmaxmap = new Array();
		let minmaxmap = new Map();
		let nodata = new Map();



		this._tileslist.forEach((tileno: number) => {
			// this._pxvalues.set(tileno, new Array(HiPSHelper.DEFAULT_Naxis1_2));  // <- bidimensional
			// for (let row = 0; row < HiPSHelper.DEFAULT_Naxis1_2; row++) {

			this._pxvalues.set(tileno, new Array(this._HIPS_TILE_WIDTH));  // <- bidimensional
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
		let ra: number;
		let dec: number;
		let col: number;
		let row: number;

		for (let rdidx = 0; rdidx < this._radeclist.length; rdidx++) {
			[ra, dec] = this._radeclist[rdidx];
			let ac = fillAstro(ra, dec, NumberType.DEGREES);
			let sc = astroToSpherical(ac);
			let ptg = new Pointing(null, false, sc.thetaRad, sc.phiRad);
			let pixtileno: number = this._hp.ang2pix(ptg);

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
						p[row][col * bytesXelem + b] = byte	// <- bidimensional
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
					let valpixb = ParseUtils.extractPixelValue(0, p[row].slice(col * bytesXelem, col * bytesXelem + bytesXelem), bitpix);
					if (valpixb == null) {
						continue
					}
					let valphysical = bzero + bscale * valpixb;
					if (valphysical < min || isNaN(min)) {
						minmaxmap.get("" + pixtileno + "")[0] = valphysical;
					} else if (valphysical > max || isNaN(max)) {
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
				let header = new FITSHeaderManager();
				header.insert(new FITSHeaderItem("NPIX", tileno, ""));
				// TODO CONVERT minval and maxval to physical values!
				// header.insert(new FITSHeaderItem("DATAMIN", minmaxmap["" + tileno + ""][0]));
				// header.insert(new FITSHeaderItem("DATAMAX", minmaxmap["" + tileno + ""][1]));
				header.insert(new FITSHeaderItem("DATAMIN", minmaxmap.get("" + tileno + "")[0], ""));
				header.insert(new FITSHeaderItem("DATAMAX", minmaxmap.get("" + tileno + "")[1], ""));
				header.insert(new FITSHeaderItem("NPIX", tileno, ""));

				let vec3 = this._hp.pix2vec(tileno);
				let ptg = new Pointing(vec3);
				let crval1 = radToDeg(ptg.phi);
				let crval2 = 90 - radToDeg(ptg.theta);

				header.insert(new FITSHeaderItem("CRVAL1", crval1, ""));
				header.insert(new FITSHeaderItem("CRVAL2", crval2, ""));

				this._fitsheaderlist.push(header);
			} else { // no data
				// this._pxvalues.delete(parseInt(tileno));
				this._pxvalues.delete(tileno);
				// delete this._pxvalues["" + tileno + ""];
			}

		});
		this.prepareFITSHeader(fitsHeaderParams);
		return this._pxvalues;

	}

	getImageRADecList(center: Point, radiusDeg: number): Array<[number, number]> {

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

		this._tileslist.forEach((tileno: number) => {
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


	pix2world(i: number, j: number): Point {

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
	convertToGalactic(radeclist: number[][]): number[][] {
		let finalradeclist: number[][] = [];
		const deg2rad = Math.PI / 180
		const rad2deg = 180 / Math.PI
		const l_NCP = deg2rad * 122.930
		const d_NGP = deg2rad * 27.1284
		const a_NGP = deg2rad * 192.8595
		radeclist.forEach(([ra, dec]) => {
			const ra_rad = deg2rad * ra
			const dec_rad = deg2rad * dec
			// sin(b)
			const sin_b = Math.sin(d_NGP) * Math.sin(dec_rad) +
				Math.cos(d_NGP) * Math.cos(dec_rad) * Math.cos(ra_rad - a_NGP);
			const b = Math.asin(sin_b)
			const b_deg = b * rad2deg

			// l_NCP - l
			const lNCP_minus_l = Math.atan((Math.cos(dec_rad) * Math.sin(ra_rad - a_NGP)) /
				(Math.sin(dec_rad) * Math.cos(d_NGP) - Math.cos(dec_rad) * Math.sin(d_NGP) * Math.cos(ra_rad - a_NGP)));
			const l = l_NCP - lNCP_minus_l
			const l_deg = l * rad2deg

			finalradeclist.push([l_deg, b_deg])
		});
		return finalradeclist;
	}

	world2pix(radeclist: number[][]): ImagePixel[] {

		// let imgpxlist = new ImagePixel[radeclist.length];
		let imgpxlist: ImagePixel[] = [];
		let tileno: number;
		let prevTileno: number | undefined = undefined;
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
