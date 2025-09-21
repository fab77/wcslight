import { FITSHeaderItem, FITSHeaderManager, FITSParser, ParseUtils } from "jsfitsio";
import { HiPSIntermediateProj } from "./HiPSIntermediateProj.js";
import { Pointing } from "healpixjs";
import { fillAstro, radToDeg } from "../../model/Utils.js";
import { NumberType } from "../../model/NumberType.js";
import { HiPSHelper } from "../HiPSHelper.js";
import { HiPSProperties } from "./HiPSProperties.js";
export class HiPSFITS {
    payload = [];
    header;
    tileno;
    order;
    tileWidth;
    healpix;
    intermediateXYGrid;
    min = NaN;
    max = NaN;
    static CTYPE1 = "RA---HPX";
    static CTYPE2 = "DEC--HPX";
    static NPIX = "NPIX";
    constructor(fitsParsed, tileno, hipsProp) {
        if (fitsParsed) {
            this.initFromFITSParsed(fitsParsed);
        }
        else if (!tileno || !hipsProp) {
            console.error("tileno or hipsProp are not defined");
            throw new Error("tileno or hipsProp are not defined");
        }
        else {
            this.order = hipsProp.getItem(HiPSProperties.ORDER);
            const naxis1 = hipsProp.getItem(HiPSProperties.TILE_WIDTH);
            const naxis2 = hipsProp.getItem(HiPSProperties.TILE_WIDTH);
            this.tileno = tileno;
            if (naxis1 != naxis2) {
                console.error("NAXIS1 and NAXIS2 do not match.");
                throw new Error("NAXIS1 and NAXIS2 do not match.");
            }
            this.tileWidth = naxis1;
            this.tileno = tileno;
            this.healpix = HiPSHelper.getHelpixByOrder(this.order);
            this.intermediateXYGrid = HiPSIntermediateProj.setupByTile(this.tileno, this.healpix);
        }
    }
    initFromUint8Array(imagePixelList, fitsHeaderParams, tileWidth) {
        this.setPayload(imagePixelList, fitsHeaderParams, tileWidth);
        this.setHeader(fitsHeaderParams);
    }
    // initFromUint8Array(raDecList: [number, number][], originalValues: Uint8Array, fitsHeaderParams: FITSHeaderManager) {
    //     this.setPayload(raDecList, originalValues, fitsHeaderParams)
    //     this.setHeader(fitsHeaderParams)
    // }
    getHeader() {
        return this.header;
    }
    getPayload() {
        return this.payload;
    }
    initFromFITSParsed(fitsParsed) {
        this.payload = fitsParsed.data;
        this.order = Number(fitsParsed.header.findById(HiPSProperties.ORDER)?.value);
        const naxis1 = Number(fitsParsed.header.findById(FITSHeaderManager.NAXIS1)?.value);
        const naxis2 = Number(fitsParsed.header.findById(FITSHeaderManager.NAXIS2)?.value);
        this.tileno = Number(fitsParsed.header.findById(HiPSFITS.NPIX)?.value);
        if (isNaN(this.order) || isNaN(naxis1) || isNaN(naxis2) || isNaN(this.tileno)) {
            console.warn("ORDER, NAXIS1 or NAXIS2 not defined");
            throw new Error("ORDER, NAXIS1 or NAXIS2 not defined");
        }
        if (naxis1 != naxis2) {
            console.error("NAXIS1 and NAXIS2 do not match.");
            throw new Error("NAXIS1 and NAXIS2 do not match.");
        }
        this.tileWidth = naxis1;
        this.computeMinMax(fitsParsed);
        this.setHeader(fitsParsed.header);
    }
    getTileno() {
        return this.tileno;
    }
    computeMinMax(fitsParsed) {
        const bitpix = Number(fitsParsed.header.findById(FITSHeaderManager.BITPIX)?.value);
        const bzero = Number(fitsParsed.header.findById(FITSHeaderManager.BZERO)?.value);
        const bscale = Number(fitsParsed.header.findById(FITSHeaderManager.BSCALE)?.value);
        const bytesXelem = Math.abs(bitpix / 8);
        for (let ridx = 0; ridx < fitsParsed.data.length; ridx++) {
            const row = fitsParsed.data[ridx];
            for (let cidx = 0; cidx < row.length; cidx++) {
                const valpixb = ParseUtils.extractPixelValue(0, this.payload[ridx].slice(cidx * bytesXelem, cidx * bytesXelem + bytesXelem), bitpix);
                if (valpixb == null) {
                    continue;
                }
                const valphysical = bzero + bscale * valpixb;
                if (valphysical < this.min || isNaN(this.min)) {
                    this.min = valphysical;
                }
                else if (valphysical > this.max || isNaN(this.max)) {
                    this.max = valphysical;
                }
            }
        }
    }
    static async downloadFITSFile(path) {
        const fits = await FITSParser.loadFITS(path);
        if (fits == null) {
            console.warn(`fits ${path} doesn't exist`);
            return null;
        }
        return fits;
    }
    getFITS() {
        return { header: this.header, data: this.payload };
    }
    setPayload(imagePixelList, fitsHeaderParams, tileWidth) {
        const bitpix = Number(fitsHeaderParams.findById(FITSHeaderManager.BITPIX)?.value);
        const bzero = Number(fitsHeaderParams.findById(FITSHeaderManager.BZERO)?.value);
        const bscale = Number(fitsHeaderParams.findById(FITSHeaderManager.BSCALE)?.value);
        const bytesXelem = Math.abs(bitpix / 8);
        if (!bytesXelem) {
            console.error("BITPIX not defined");
            throw new Error("BITPIX not defined");
        }
        this.payload = new Array(tileWidth);
        for (let row = 0; row < tileWidth; row++) {
            this.payload[row] = new Uint8Array(tileWidth * bytesXelem);
        }
        imagePixelList.forEach((imgpx) => {
            const ra = imgpx.getRADeg();
            const dec = imgpx.getDecDeg();
            const ac = fillAstro(ra, dec, NumberType.DEGREES);
            if (ac == null) {
                console.error(`Error converting ${ra}, ${dec} into AstroCoords object`);
                return;
            }
            const xy = HiPSIntermediateProj.world2intermediate(ac);
            const [col, row] = HiPSIntermediateProj.intermediate2pix(xy[0], xy[1], this.intermediateXYGrid, tileWidth);
            if (row < 0 || row >= tileWidth || col < 0 || col >= tileWidth)
                return;
            const valueBytes = imgpx.getUint8Value();
            if (!valueBytes)
                return; // or continue, depending on context
            for (let b = 0; b < bytesXelem; b++) {
                this.payload[row][col * bytesXelem + b] = valueBytes[b];
            }
            const valpixb = ParseUtils.extractPixelValue(0, valueBytes, bitpix);
            if (valpixb == null)
                return;
            const valphysical = bzero + bscale * valpixb;
            if (isNaN(this.min) || valphysical < this.min)
                this.min = valphysical;
            if (isNaN(this.max) || valphysical > this.max)
                this.max = valphysical;
        });
    }
    // private setPayload(raDecList: [number, number][], originalValues: Uint8Array, fitsHeaderParams: FITSHeaderManager) {
    //     const bitpix = Number(fitsHeaderParams.findById(FITSHeaderManager.BITPIX)?.value)
    //     const bzero = Number(fitsHeaderParams.findById(FITSHeaderManager.BZERO)?.value)
    //     const bscale = Number(fitsHeaderParams.findById(FITSHeaderManager.BSCALE)?.value)
    //     const bytesXelem = Math.abs(bitpix / 8)
    //     if (!bytesXelem) {
    //         console.error("BITPIX not defined")
    //         throw new Error("BITPIX not defined")
    //     }
    //     this.payload = new Array(this.tileWidth)
    //     for (let row = 0; row < this.tileWidth; row++) {
    //         this.payload[row] = new Uint8Array(this.tileWidth * bytesXelem)
    //     }
    //     for (let rdidx = 0; rdidx < raDecList.length; rdidx++) {
    //         const [ra, dec] = raDecList[rdidx]
    //         const ac = fillAstro(ra, dec, NumberType.DEGREES)
    //         if (ac == null) {
    //             console.error(`Error converting ${ra}, ${dec} into AstroCoords object`)
    //             continue
    //         }
    //         const sc = astroToSpherical(ac)
    //         const ptg = new Pointing(null, false, sc.thetaRad, sc.phiRad)
    //         const pixtileno: number = this.healpix.ang2pix(ptg)
    //         if (pixtileno != this.tileno) {
    //             continue
    //         }
    //         const xy = HiPSIntermediateProj.world2intermediate(ac);
    //         let ij = HiPSIntermediateProj.intermediate2pix(xy[0], xy[1], this.intermediateXYGrid, this.tileWidth);
    //         const col = ij[0];
    //         const row = ij[1];
    //         for (let b = 0; b < bytesXelem; b++) {
    //             const byte = originalValues[rdidx * bytesXelem + b];
    //             this.payload[row][col * bytesXelem + b] = byte
    //             // TODO check what's nodata!
    //             // if (nodata.get("" + pixtileno + "")) {
    //             // 	if (byte != 0) {
    //             // 		nodata.set("" + pixtileno + "", false);
    //             // 	}
    //             // }
    //             const valpixb = ParseUtils.extractPixelValue(0, this.payload[row].slice(col * bytesXelem, col * bytesXelem + bytesXelem), bitpix);
    //             if (valpixb == null) {
    //                 continue
    //             }
    //             const valphysical = bzero + bscale * valpixb;
    //             if (valphysical < this.min || isNaN(this.min)) {
    //                 this.min = valphysical;
    //             } else if (valphysical > this.max || isNaN(this.max)) {
    //                 this.max = valphysical;
    //             }
    //         }
    //     }
    // }
    addMandatoryItemToHeader(key, fitsHeaderParams) {
        const value = fitsHeaderParams.findById(key)?.value;
        if (value === undefined || value == null) {
            console.error(`${key} not defined`);
            throw new Error(key + " is not defined");
        }
        const item = new FITSHeaderItem(key, value, "");
        this.header.insert(item);
    }
    addItemToHeader(key, fitsHeaderParams) {
        const value = fitsHeaderParams.findById(key)?.value;
        if (value !== undefined || value != null) {
            const item = new FITSHeaderItem(key, value, "");
            this.header.insert(item);
        }
    }
    setHeader(fitsHeaderParams) {
        this.header = new FITSHeaderManager();
        this.addMandatoryItemToHeader(FITSHeaderManager.SIMPLE, fitsHeaderParams);
        this.addMandatoryItemToHeader(FITSHeaderManager.BITPIX, fitsHeaderParams);
        this.addItemToHeader(FITSHeaderManager.BLANK, fitsHeaderParams);
        this.addItemToHeader(FITSHeaderManager.BSCALE, fitsHeaderParams);
        this.addItemToHeader(FITSHeaderManager.BZERO, fitsHeaderParams);
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.NAXIS, Number(2), ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.NAXIS1, Number(this.tileWidth), ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.NAXIS2, Number(this.tileWidth), ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CTYPE1, HiPSFITS.CTYPE1, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CTYPE2, HiPSFITS.CTYPE2, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.DATAMIN, this.min, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.DATAMAX, this.min, ""));
        this.header.insert(new FITSHeaderItem(HiPSProperties.ORDER, Number(this.order), ""));
        this.header.insert(new FITSHeaderItem(HiPSFITS.NPIX, Number(this.tileno), ""));
        const crpix = this.tileno / 2;
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CRPIX1, crpix, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CRPIX2, crpix, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.ORIGIN, "WCSLight v.0.x", ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.COMMENT, "", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar"));
        let vec3 = this.healpix.pix2vec(this.tileno);
        let ptg = new Pointing(vec3);
        let crval1 = radToDeg(ptg.phi);
        let crval2 = 90 - radToDeg(ptg.theta);
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CRVAL1, crval1, ""));
        this.header.insert(new FITSHeaderItem(FITSHeaderManager.CRVAL2, crval2, ""));
        this.header.insert(new FITSHeaderItem("END", "", ""));
    }
}
//# sourceMappingURL=HiPSFITS.js.map