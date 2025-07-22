/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */



import { FITSParser, FITSHeaderManager, FITSHeaderItem, FITSParsed, ParseUtils } from 'jsfitsio';


import { AbstractProjection } from '../AbstractProjection.js';
import { Point } from '../../model/Point.js';
import { CoordsType } from '../../model/CoordsType.js';
import { NumberType } from '../../model/NumberType.js';
import { TilesRaDecList2 } from '../hips/TilesRaDecList2.js';
import { ImagePixel } from '../hips/ImagePixel.js';
// import { HiPSProp } from '../hips/HiPSProp.js';


export class MercatorProjection extends AbstractProjection {

    minra!: number;
    mindec!: number;
    naxis1!: number;
    naxis2!: number;
    bitpix!: number

    fitsheader: FITSHeaderManager;
    pxvalues: Array<Uint8Array>;

    CTYPE1: string = "'RA---CAR'";
    CTYPE2: string = "'DEC--CAR'";
    craDeg!: number;
    cdecDeg!: number;

    pxsize!: number;
    pxsize1!: number;
    pxsize2!: number;

    // _minphysicalval!: number;
    // _maxphysicalval!: number;
    _wcsname: string;

    constructor() {
        super();
        this._wcsname = "MER"; // TODO check WCS standard and create ENUM
        this.pxvalues = new Array<Uint8Array>();
        this.fitsheader = new FITSHeaderManager();
    }


    async initFromFile(infile: string): Promise<FITSParsed> {

        const fits = await FITSParser.loadFITS(infile);
        if (!fits) {
            console.error("FITS is null")
            throw new Error("FITS is null")
        }

        this.pxvalues = fits.data;
        this.fitsheader = fits.header;
        this.naxis1 = Number(fits.header.findById("NAXIS1")?.value)
        this.naxis2 = Number(fits.header.findById("NAXIS2")?.value)

        this.bitpix = fits.header.findById("BITPIX")?.value as number;
        this.craDeg = fits.header.findById("CRVAL1")?.value as number;
        this.cdecDeg = fits.header.findById("CRVAL2")?.value as number;

        const pxsize1 = this.fitsheader.findById("CDELT1")?.value as number;
        const pxsize2 = this.fitsheader.findById("CDELT2")?.value as number;
        if (pxsize1 !== pxsize2 || pxsize1 === undefined || pxsize2 === undefined) {
            throw new Error("pxsize1 is not equal to pxsize2")
        }
        this.pxsize = pxsize1;

        this.minra = this.craDeg - this.pxsize * this.naxis1 / 2;
        if (this.minra < 0) {
            this.minra += 360;
        }
        // this._mindec = this._cdecDeg - this._pxsize2 * this._naxis2 / 2;
        this.mindec = this.cdecDeg - this.pxsize * this.naxis2 / 2;

        return fits;

    }

    getBytePerValue(): number {
        return Math.abs(this.bitpix / 8);
    }


    extractPhysicalValues(fits: FITSParsed): number[][] {

        const bzero = Number(fits.header.findById("BZERO")?.value);
        const bscale = Number(fits.header.findById("BSCALE")?.value);
        const naxis1 = Number(fits.header.findById("NAXIS1")?.value);
        const naxis2 = Number(fits.header.findById("NAXIS2")?.value);
        const bitpix = Number(fits.header.findById("BITPIX")?.value);
        const bytesXelem = Math.abs(bitpix / 8);

        let physicalvalues: number[][] = new Array<number[]>(naxis2);

        for (let n2 = 0; n2 < naxis2; n2++) {
            physicalvalues[n2] = new Array<number>(naxis1);
            for (let n1 = 0; n1 < naxis1; n1++) {
                const pixval = ParseUtils.extractPixelValue(0, fits.data[n2].slice(n1 * bytesXelem, (n1 + 1) * bytesXelem), bitpix);
                if (pixval) {
                    let physicalVal = bzero + bscale * pixval;
                    physicalvalues[n2][n1] = physicalVal;
                }

            }
        }
        return physicalvalues;
    }

    // computeHeader(pxsize: number, bitpix: number, scale: number = 1, zero: number = 0, blank: number = 0): FITSHeaderManager{
    //     const header = new FITSHeaderManager()

    //     header.insert(new FITSHeaderItem("SIMPLE", "'T'", ""));
    //     header.insert(new FITSHeaderItem("BITPIX", bitpix, ""));
    //     header.insert(new FITSHeaderItem("NAXIS", 2, ""));
    //     header.insert(new FITSHeaderItem("NAXIS1", this.naxis1, ""));
    //     header.insert(new FITSHeaderItem("NAXIS2", this.naxis2, ""));
        
    //     header.insert(new FITSHeaderItem("BLANK", blank, ""));
        
    //     header.insert(new FITSHeaderItem("BSCALE", scale, ""));

    //     header.insert(new FITSHeaderItem("BZERO", zero, ""));

    //     header.insert(new FITSHeaderItem("CTYPE1", this.CTYPE1, ""));
    //     header.insert(new FITSHeaderItem("CTYPE2", this.CTYPE2, ""));

    //     header.insert(new FITSHeaderItem("CDELT1", pxsize, "")); // ??? Pixel spacing along axis 1 ???
    //     header.insert(new FITSHeaderItem("CDELT2", pxsize, "")); // ??? Pixel spacing along axis 2 ???
    //     header.insert(new FITSHeaderItem("CRPIX1", this.naxis1 / 2, "")); // central/reference pixel i along naxis1
    //     header.insert(new FITSHeaderItem("CRPIX2", this.naxis2 / 2, "")); // central/reference pixel j along naxis2
    //     header.insert(new FITSHeaderItem("CRVAL1", this.craDeg, "")); // central/reference pixel RA
    //     header.insert(new FITSHeaderItem("CRVAL2", this.cdecDeg, "")); // central/reference pixel Dec

    //     let min = zero + scale * this._minphysicalval;
    //     let max = zero + scale * this._maxphysicalval;
    //     header.insert(new FITSHeaderItem("DATAMIN", min, "")); // min data value
    //     header.insert(new FITSHeaderItem("DATAMAX", max, "")); // max data value


    //     header.insert(new FITSHeaderItem("ORIGIN", "'WCSLight v.0.x'", ""));
    //     header.insert(new FITSHeaderItem("COMMENT", "", "'WCSLight v0.x developed by F.Giordano and Y.Ascasibar'"));
    //     header.insert(new FITSHeaderItem("END", "", ""));

    //     return this.fitsheader;


    // }

    // TODO CHECK: there are 4 header related methods!!! prepareHeader, prepareFITSHeader, getCommonFitsHeaderParams and getFITSHeader
    // static prepareHeader(radius: number, pixelAngSize: number,
    //     bitpix: number, bscale?: number, bzero?: number
    // ) {
    //     if (!bscale) bscale = 1
    //     if (!bzero) bzero = 0
    //     const naxis1 = Math.ceil(2 * radius / pixelAngSize);
    //     const naxis2 = naxis1
    //     if (!bitpix) {
    //         throw new Error("Bitpix not defined")
    //     }
    // }

    
    prepareHeader(pixelAngSize: number, 
                BITPIX: number, 
                TILE_WIDTH: number, 
                BLANK: number, BZERO: number, BSCALE: number,
                cRA: number, cDec: number,
                minValue: number, maxValue: number): FITSHeaderManager{
        
        const fitsheader = new FITSHeaderManager();

        fitsheader.insert(new FITSHeaderItem("SIMPLE", "T", ""));
        fitsheader.insert(new FITSHeaderItem("NAXIS1", TILE_WIDTH, ""));
        fitsheader.insert(new FITSHeaderItem("NAXIS2", TILE_WIDTH, ""));
        fitsheader.insert(new FITSHeaderItem("NAXIS", 2, ""));
        fitsheader.insert(new FITSHeaderItem("BITPIX", BITPIX, ""));
        fitsheader.insert(new FITSHeaderItem("BLANK", BLANK, ""));
        fitsheader.insert(new FITSHeaderItem("BSCALE", BSCALE, ""));
        fitsheader.insert(new FITSHeaderItem("BZERO", BZERO, ""));

        fitsheader.insert(new FITSHeaderItem("CTYPE1", this.CTYPE1, ""));
        fitsheader.insert(new FITSHeaderItem("CTYPE2", this.CTYPE2, ""));

        fitsheader.insert(new FITSHeaderItem("CDELT1", pixelAngSize, "")); // ??? Pixel spacing along axis 1 ???
        fitsheader.insert(new FITSHeaderItem("CDELT2", pixelAngSize, "")); // ??? Pixel spacing along axis 2 ???
        fitsheader.insert(new FITSHeaderItem("CRPIX1", TILE_WIDTH / 2, "")); // central/reference pixel i along naxis1
        fitsheader.insert(new FITSHeaderItem("CRPIX2", TILE_WIDTH / 2, "")); // central/reference pixel j along naxis2
        
        fitsheader.insert(new FITSHeaderItem("CRVAL1", cRA, "")); // central/reference pixel RA
        fitsheader.insert(new FITSHeaderItem("CRVAL2", cDec, "")); // central/reference pixel Dec

        const min = BZERO + BSCALE * minValue;
        const max = BZERO + BSCALE * maxValue;
        fitsheader.insert(new FITSHeaderItem("DATAMIN", min, "")); // min data value
        fitsheader.insert(new FITSHeaderItem("DATAMAX", max, "")); // max data value


        fitsheader.insert(new FITSHeaderItem("ORIGIN", "'WCSLight v.0.x'", ""));
        fitsheader.insert(new FITSHeaderItem("COMMENT", "", "'WCSLight v0.x developed by F.Giordano and Y.Ascasibar'"));
        fitsheader.insert(new FITSHeaderItem("END", "", ""));

        return fitsheader;

    }


    // TODO CHECK: there are 4 header related methods!!! prepareHeader, prepareFITSHeader, getCommonFitsHeaderParams and getFITSHeader
    // prepareFITSHeader(fitsHeaderParams: FITSHeaderManager): FITSHeaderManager {

    //     this.fitsheader = new FITSHeaderManager();

    //     this.fitsheader.insert(new FITSHeaderItem("NAXIS1", this.naxis1, ""));
    //     this.fitsheader.insert(new FITSHeaderItem("NAXIS2", this.naxis2, ""));
    //     this.fitsheader.insert(new FITSHeaderItem("NAXIS", 2, ""));

    //     const bitpix = Number(fitsHeaderParams.findById("BITPIX")?.value)
    //     this.fitsheader.insert(new FITSHeaderItem("BITPIX", bitpix, ""));

    //     const simple = Number(fitsHeaderParams.findById("SIMPLE")?.value)
    //     this.fitsheader.insert(new FITSHeaderItem("SIMPLE", simple, ""));

    //     const blank = Number(fitsHeaderParams.findById("BLANK")?.value)
    //     if (blank) {
    //         this.fitsheader.insert(new FITSHeaderItem("BLANK", blank, ""));
    //     }

    //     let bscale = Number(fitsHeaderParams.findById("BSCALE")?.value)
    //     if (!bscale) {
    //         bscale = 1.0;
    //     }
    //     this.fitsheader.insert(new FITSHeaderItem("BSCALE", bscale, ""));

    //     let bzero = Number(fitsHeaderParams.findById("BZERO")?.value)
    //     if (!bzero) {
    //         bzero = 0.0;
    //     }
    //     this.fitsheader.insert(new FITSHeaderItem("BZERO", bzero, ""));

    //     this.fitsheader.insert(new FITSHeaderItem("CTYPE1", this.CTYPE1, ""));
    //     this.fitsheader.insert(new FITSHeaderItem("CTYPE2", this.CTYPE2, ""));

    //     this.fitsheader.insert(new FITSHeaderItem("CDELT1", this.pxsize, "")); // ??? Pixel spacing along axis 1 ???
    //     this.fitsheader.insert(new FITSHeaderItem("CDELT2", this.pxsize, "")); // ??? Pixel spacing along axis 2 ???
    //     this.fitsheader.insert(new FITSHeaderItem("CRPIX1", this.naxis1 / 2, "")); // central/reference pixel i along naxis1
    //     this.fitsheader.insert(new FITSHeaderItem("CRPIX2", this.naxis2 / 2, "")); // central/reference pixel j along naxis2
    //     this.fitsheader.insert(new FITSHeaderItem("CRVAL1", this.craDeg, "")); // central/reference pixel RA
    //     this.fitsheader.insert(new FITSHeaderItem("CRVAL2", this.cdecDeg, "")); // central/reference pixel Dec

    //     let min = bzero + bscale * this._minphysicalval;
    //     let max = bzero + bscale * this._maxphysicalval;
    //     this.fitsheader.insert(new FITSHeaderItem("DATAMIN", min, "")); // min data value
    //     this.fitsheader.insert(new FITSHeaderItem("DATAMAX", max, "")); // max data value


    //     this.fitsheader.insert(new FITSHeaderItem("ORIGIN", "'WCSLight v.0.x'", ""));
    //     this.fitsheader.insert(new FITSHeaderItem("COMMENT", "", "'WCSLight v0.x developed by F.Giordano and Y.Ascasibar'"));
    //     this.fitsheader.insert(new FITSHeaderItem("END", "", ""));

    //     return this.fitsheader;

    // }
    // TODO CHECK: there are 4 header related methods!!! prepareHeader, prepareFITSHeader, getCommonFitsHeaderParams and getFITSHeader
    getFITSHeader(): FITSHeaderManager {
        return this.fitsheader;
    }
    // TODO CHECK: there are 4 header related methods!!! prepareHeader, prepareFITSHeader, getCommonFitsHeaderParams and getFITSHeader
    getCommonFitsHeaderParams(): FITSHeaderManager {
        let header = new FITSHeaderManager();
        for (const item of this.fitsheader.getItems()) {
            const key = item.key
            if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER",].includes(key)) {
                const value = item.value
                header.insert(new FITSHeaderItem(key, value, ""));
            }
        }
        return header;
    }


    // setPxsValue(raDecList: TilesRaDecList2, bitpix: number, scale: number = 1, zero: number = 0): TilesRaDecList2 {
    //     return new TilesRaDecList2()
    // }
    setPxsValue(raDecList: TilesRaDecList2, bitpix: number, scale: number = 1, zero: number = 0): TilesRaDecList2 {

        let bytesXelem = Math.abs(bitpix / 8);

        
        this._pxvalues.set(0, new Array<Uint8Array>(this.naxis2));
        let pv = this._pxvalues.get(0);
        if (pv !== undefined) {
            for (let r = 0; r < this.naxis2; r++) {
                pv[r] = new Uint8Array(this.naxis1 * bytesXelem);
            }

            let r!: number;
            let c!: number;
            let b!: number;
            for (let p = 0; (p * bytesXelem) < values.length; p++) {
                // console.log("processing "+p + " of "+ (values.length / bytesXelem));

                try {
                    r = Math.floor(p / this.naxis1);
                    c = (p - r * this.naxis1) * bytesXelem;

                    for (b = 0; b < bytesXelem; b++) {
                        pv[r][c + b] = values[p * bytesXelem + b];
                    }


                    const valpixb = ParseUtils.extractPixelValue(0, values.slice(p * bytesXelem, (p * bytesXelem) + bytesXelem), bitpix);
                    if (!valpixb) {
                        console.error("valpixb is null")
                        throw new Error("valpixb is null")
                    }

                    // let valphysical = zero + scale * valpixb;

                    // if (valphysical < this._minphysicalval || isNaN(this._minphysicalval)) {
                    //     this._minphysicalval = valphysical;
                    // } else if (valphysical > this._maxphysicalval || isNaN(this._maxphysicalval)) {
                    //     this._maxphysicalval = valphysical;
                    // }
                } catch (err) {
                    console.log(err)
                    console.log("p " + p)
                    console.log("r %, c %, b %" + r, c, b)
                    console.log("this._pxvalues[r][c + b] " + pv[r][c + b])
                    console.log("values[p * bytesXelem + b] " + values[p * bytesXelem + b])
                }

            }
        }

        // this.prepareFITSHeader(fitsHeaderParams);
        return this._pxvalues;

    }


    // computeSquaredNaxes(d: number, ps: number): void {
    //     this._naxis1 = Math.ceil(d / ps);
    //     this._naxis2 = this._naxis1;
    //     this._pxsize = ps;
    // }

    getImageRADecList(center: Point, radius: number, pxsize: number): TilesRaDecList2 {


        const naxis1 = Math.ceil(2 * radius / pxsize);
        const naxis2 = naxis1;

        let minra = center.getAstro().raDeg - radius;
        if (minra < 0) {
            minra += 360;
        }
        const mindec = center.getAstro().decDeg - radius;

        const tilesRaDecList = new TilesRaDecList2()

        // let radeclist: Array<[number, number]> = new Array<[number, number]>();

        // let centralRa, centralDec
        for (let d = 0; d < naxis2; d++) {
            for (let r = 0; r < naxis1; r++) {
                tilesRaDecList.addImagePixel(new ImagePixel(minra + (r * pxsize), mindec + (d * pxsize), undefined))
                // radeclist.push([minra + (r * pxsize), mindec + (d * pxsize)]);
            }
        }
        
        const centralImgpx = tilesRaDecList.getImagePixelList().length/2 - 1
        // let cidx = (naxis2 / 2) * naxis1 + naxis1 / 2;
        // if (naxis1 % 2 != 0) {
        //     cidx = Math.floor(radeclist.length / 2);
        // }
        // this._craDeg = radeclist[cidx][0];
        // this._cdecDeg = radeclist[cidx][1];

        // return radeclist
        return tilesRaDecList

    }



    /** TODO !!! check and handle RA passing through 360-0 */
    pix2world(i: number, j: number): Point {

        let ra: number;
        let dec: number;
        // ra = i * this._stepra + this._minra;
        // dec = j * this._stepdec + this._mindec;
        ra = i * this.pxsize + this.minra;
        dec = j * this.pxsize + this.mindec;
        let p = new Point(CoordsType.ASTRO, NumberType.DEGREES, ra, dec);
        return p;
        // return [ra, dec];

    }


    world2pix(raDecList: TilesRaDecList2): TilesRaDecList2 {

        const bytesXvalue = this.getBytePerValue()

        // TODO if I have the this.fitsheader available here, check if I can retrieve this.bitpix, this.pxsize, ... with this.fitsheader
        // and remove the attributes at object level (with this)
        const blank = Number(this.fitsheader.findById("BLANK")?.value)
        const blankBytes = ParseUtils.convertBlankToBytes(blank, bytesXvalue);

        for (let imgPx of raDecList.getImagePixelList()) {

            // console.log("raDeclist.getImagePixelList().indexOf(imgPx) " + raDeclist.getImagePixelList().indexOf(imgPx))
            const ra = imgPx.getRADeg();
            const dec = imgPx.getDecDeg();

            const i = Math.floor((ra - this.minra) / this.pxsize);
            const j = Math.floor((dec - this.mindec) / this.pxsize);

            if (j < 0 || j >= this.naxis2 || i < 0 || i >= this.naxis1) {
                imgPx.setValue(blankBytes, this.bitpix)
            } else {
                const currentValue = this.pxvalues[j].slice(i * bytesXvalue, (i + 1) * bytesXvalue);
                imgPx.setValue(currentValue, this.bitpix)
            }
            raDecList.setMinMaxValue(imgPx.getValue())
        }
        return raDecList;

    }

}
