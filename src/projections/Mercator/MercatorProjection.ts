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
import { ImagePixel } from '../../model/ImagePixel.js';
import { Point } from '../../model/Point.js';
import { CoordsType } from '../../model/CoordsType.js';
import { NumberType } from '../../model/NumberType.js';


export class MercatorProjection extends AbstractProjection {

    _minra!: number;
    _mindec!: number;
    _naxis1!: number;
    _naxis2!: number;

    _fitsheader: FITSHeaderManager[];
    _infile!: string;
    _ctype1: string; // TODO should be RA ENUM
    _ctype2: string; // TODO should be Dec ENUM
    _craDeg!: number;
    _cdecDeg!: number;

    _pxsize!: number;
    _pxsize1!: number;
    _pxsize2!: number;

    _pxvalues: Map<number, Array<Uint8Array>>;
    _minphysicalval!: number;
    _maxphysicalval!: number;
    _wcsname: string;
    _fitsUsed: String[] = [];

    constructor() {
        super()
        this._ctype1 = "'RA---CAR'";
        this._ctype2 = "'DEC--CAR'";
        this._wcsname = "MER"; // TODO check WCS standard and create ENUM
        this._pxvalues = new Map<number, Array<Uint8Array>>();
        this._fitsheader = new Array<FITSHeaderManager>();
    }


    async initFromFile(infile: string): Promise<FITSParsed> {

        const fits = await FITSParser.loadFITS(infile);
        if (!fits) {
            console.error("FITS is null")
            throw new Error("FITS is null")
        }
        this._infile = infile;
        this._fitsUsed.push(infile)

        this._pxvalues.set(0, fits.data);
        this._fitsheader[0] = fits.header;
        this._naxis1 = Number(fits.header.findById("NAXIS1")?.value)
        this._naxis2 = Number(fits.header.findById("NAXIS2")?.value)
        
        this._craDeg = fits.header.findById("CRVAL1")?.value as number;
        this._cdecDeg = fits.header.findById("CRVAL2")?.value as number;

        const pxsize1 = this._fitsheader[0].findById("CDELT1")?.value as number;
        const pxsize2 = this._fitsheader[0].findById("CDELT2")?.value as number;
        if (pxsize1 !== pxsize2 || pxsize1 === undefined || pxsize2 === undefined) {
            throw new Error("pxsize1 is not equal to pxsize2")
        }
        this._pxsize = pxsize1;

        this._minra = this._craDeg - this._pxsize * this._naxis1 / 2;
        if (this._minra < 0) {
            this._minra += 360;
        }
        // this._mindec = this._cdecDeg - this._pxsize2 * this._naxis2 / 2;
        this._mindec = this._cdecDeg - this._pxsize * this._naxis2 / 2;

        return fits;

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

    prepareFITSHeader(fitsHeaderParams: FITSHeaderManager): FITSHeaderManager[] {

        this._fitsheader[0] = new FITSHeaderManager();

        this._fitsheader[0].insert(new FITSHeaderItem("NAXIS1", this._naxis1, ""));
        this._fitsheader[0].insert(new FITSHeaderItem("NAXIS2", this._naxis2, ""));
        this._fitsheader[0].insert(new FITSHeaderItem("NAXIS", 2, ""));

        const bitpix = Number(fitsHeaderParams.findById("BITPIX")?.value)
        this._fitsheader[0].insert(new FITSHeaderItem("BITPIX", bitpix, ""));
        
        const simple = Number(fitsHeaderParams.findById("SIMPLE")?.value)
        this._fitsheader[0].insert(new FITSHeaderItem("SIMPLE", simple, ""));

        const blank = Number(fitsHeaderParams.findById("BLANK")?.value)
        if (blank) {
            this._fitsheader[0].insert(new FITSHeaderItem("BLANK", blank, ""));
        }

        let bscale = Number(fitsHeaderParams.findById("BSCALE")?.value)
        if (!bscale) {
            bscale = 1.0;
        }
        this._fitsheader[0].insert(new FITSHeaderItem("BSCALE", bscale, ""));

        let bzero = Number(fitsHeaderParams.findById("BZERO")?.value)
        if (!bzero) {
            bzero = 0.0;
        }
        this._fitsheader[0].insert(new FITSHeaderItem("BZERO", bzero, ""));

        this._fitsheader[0].insert(new FITSHeaderItem("CTYPE1", this._ctype1, ""));
        this._fitsheader[0].insert(new FITSHeaderItem("CTYPE2", this._ctype2, ""));

        this._fitsheader[0].insert(new FITSHeaderItem("CDELT1", this._pxsize, "")); // ??? Pixel spacing along axis 1 ???
        this._fitsheader[0].insert(new FITSHeaderItem("CDELT2", this._pxsize, "")); // ??? Pixel spacing along axis 2 ???
        this._fitsheader[0].insert(new FITSHeaderItem("CRPIX1", this._naxis1 / 2, "")); // central/reference pixel i along naxis1
        this._fitsheader[0].insert(new FITSHeaderItem("CRPIX2", this._naxis2 / 2, "")); // central/reference pixel j along naxis2
        this._fitsheader[0].insert(new FITSHeaderItem("CRVAL1", this._craDeg, "")); // central/reference pixel RA
        this._fitsheader[0].insert(new FITSHeaderItem("CRVAL2", this._cdecDeg, "")); // central/reference pixel Dec

        let min = bzero + bscale * this._minphysicalval;
        let max = bzero + bscale * this._maxphysicalval;
        this._fitsheader[0].insert(new FITSHeaderItem("DATAMIN", min, "")); // min data value
        this._fitsheader[0].insert(new FITSHeaderItem("DATAMAX", max, "")); // max data value


        this._fitsheader[0].insert(new FITSHeaderItem("ORIGIN", "'WCSLight v.0.x'", ""));
        this._fitsheader[0].insert(new FITSHeaderItem("COMMENT", "", "'WCSLight v0.x developed by F.Giordano and Y.Ascasibar'"));
        this._fitsheader[0].insert(new FITSHeaderItem("END", "", ""));

        return this._fitsheader;

    }

    getFITSHeader(): FITSHeaderManager[] {
        return this._fitsheader;
    }

    getCommonFitsHeaderParams(): FITSHeaderManager {
        let header = new FITSHeaderManager();
        for (const item of this._fitsheader[0].getItems()) {
            const key = item.key
        // for (let i = 0; i < this._fitsheader[0].getItems(); i++ ) {

            // I could add a list of used NPIXs to be included in the comment of the output FITS
            if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER",].includes(key)) {
                const value = item.value
                header.insert(new FITSHeaderItem(key, value, ""));
            }
        }
        return header;
    }

    get fitsUsed(): String[] {
        return this._fitsUsed;
    }

    async getPixValues(inputPixelsList: ImagePixel[]): Promise<Uint8Array> {

        let promise = new Promise<Uint8Array>((resolve, reject) => {
            try {
                const bitpix = Number(this._fitsheader[0].findById("BITPIX")?.value)
                let bytesXelem = Math.abs(bitpix / 8);

                const blank = Number(this._fitsheader[0].findById("BLANK")?.value)
                let blankBytes = ParseUtils.convertBlankToBytes(blank, bytesXelem);
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
                    } else {
                        let pv = this._pxvalues.get(0);
                        if (pv !== undefined) {

                            for (let b = 0; b < bytesXelem; b++) {

                                values[p * bytesXelem + b] = pv[imgpx._j][(imgpx._i) * bytesXelem + b];
                            }
                        }

                    }
                }
                resolve(values);
            } catch (err) {
                reject("[MercatorProjection] ERROR: " + err);
            }

        });
        return promise;

    }

    setPxsValue(values: Uint8Array, fitsHeaderParams: FITSHeaderManager): Map<number, Array<Uint8Array>> {

        const bitpix = Number(this._fitsheader[0].findById("BITPIX")?.value)
        let bytesXelem = Math.abs(bitpix / 8);


        let minpixb = ParseUtils.extractPixelValue(0, values.slice(0, bytesXelem), Number(fitsHeaderParams.findById("BITPIX")?.value));
        if (!minpixb) {
            console.error("minpixb is null")
            throw new Error("minpixb is null")
        }
        let maxpixb = minpixb;
        

        let bscale = (fitsHeaderParams.findById("BSCALE") !== undefined) ? Number(fitsHeaderParams.findById("BSCALE")?.value) : 1.0;
        let bzero = (fitsHeaderParams.findById("BZERO") !== undefined) ? Number(fitsHeaderParams.findById("BZERO")?.value) : 0.0;

        this._minphysicalval = bzero + bscale * minpixb;
        this._maxphysicalval = bzero + bscale * maxpixb;

        this._pxvalues.set(0, new Array<Uint8Array>(this._naxis2));
        let pv = this._pxvalues.get(0);
        if (pv !== undefined) {
            for (let r = 0; r < this._naxis2; r++) {
                pv[r] = new Uint8Array(this._naxis1 * bytesXelem);
            }

            let r!: number;
            let c!: number;
            let b!: number;
            for (let p = 0; (p * bytesXelem) < values.length; p++) {
                // console.log("processing "+p + " of "+ (values.length / bytesXelem));

                try {
                    r = Math.floor(p / this._naxis1);
                    c = (p - r * this._naxis1) * bytesXelem;

                    for (b = 0; b < bytesXelem; b++) {
                        pv[r][c + b] = values[p * bytesXelem + b];
                    }


                    const valpixb = ParseUtils.extractPixelValue(0, values.slice(p * bytesXelem, (p * bytesXelem) + bytesXelem), Number(fitsHeaderParams.findById("BITPIX")?.value));
                    if (!valpixb){
                        console.error("valpixb is null")
                        throw new Error("valpixb is null")
                    }

                    let valphysical = bzero + bscale * valpixb;

                    if (valphysical < this._minphysicalval || isNaN(this._minphysicalval)) {
                        this._minphysicalval = valphysical;
                    } else if (valphysical > this._maxphysicalval || isNaN(this._maxphysicalval)) {
                        this._maxphysicalval = valphysical;
                    }
                } catch (err) {
                    console.log(err)
                    console.log("p " + p)
                    console.log("r %, c %, b %" + r, c, b)
                    console.log("this._pxvalues[r][c + b] " + pv[r][c + b])
                    console.log("values[p * bytesXelem + b] " + values[p * bytesXelem + b])
                }

            }
        }

        this.prepareFITSHeader(fitsHeaderParams);
        return this._pxvalues;

    }

    static prepareHeader(radius: number, pixelAngSize: number,
        bitpix: number, bscale?: number, bzero?: number
    ) {
        if (!bscale) bscale = 1
        if (!bzero) bzero = 0
        const naxis1 = Math.ceil(2 * radius / pixelAngSize);
        const naxis2 = naxis1
        if (!bitpix) {
            throw new Error("Bitpix not defined")
        }

    }

    public computeSquaredNaxes(d: number, ps: number): void {
        this._naxis1 = Math.ceil(d / ps);
        this._naxis2 = this._naxis1;
        this._pxsize = ps;
      }

    getImageRADecList(center: Point, radius: number, pxsize: number): Array<[number, number]> {


        this.computeSquaredNaxes(2 * radius, pxsize); // compute naxis[1, 2]
        this._pxsize = pxsize;
        this._minra = center.getAstro().raDeg - radius;
        if (this._minra < 0) {
            this._minra += 360;
        }
        this._mindec = center.getAstro().decDeg - radius;

        let radeclist: Array<[number, number]> = new Array<[number, number]>();

        for (let d = 0; d < this._naxis2; d++) {
            for (let r = 0; r < this._naxis1; r++) {
                radeclist.push([this._minra + (r * this._pxsize), this._mindec + (d * this._pxsize)]);
            }
        }

        let cidx = (this._naxis2 / 2) * this._naxis1 + this._naxis1 / 2;
        if (this._naxis1 % 2 != 0) {
            cidx = Math.floor(radeclist.length / 2);
        }

        // let cidx2 = (this._naxis2 / 2 - 1) * this._naxis1 + this._naxis1 / 2;

        // let cidx = Math.ceil(radeclist.length / 2);
        // let cidx = Math.floor(radeclist.length / 2);
        this._craDeg = radeclist[cidx][0];
        this._cdecDeg = radeclist[cidx][1];

        return radeclist


    }



    /** TODO !!! check and handle RA passing through 360-0 */
    pix2world(i: number, j: number): Point {

        let ra: number;
        let dec: number;
        // ra = i * this._stepra + this._minra;
        // dec = j * this._stepdec + this._mindec;
        ra = i * this._pxsize + this._minra;
        dec = j * this._pxsize + this._mindec;
        let p = new Point(CoordsType.ASTRO, NumberType.DEGREES, ra, dec);
        return p;
        // return [ra, dec];

    }


    world2pix(radeclist: number[][]): ImagePixel[] {

        let imgpxlist: ImagePixel[] = [];

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
