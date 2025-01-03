"use strict";
/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 * 
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */


import { AbstractProjection } from './AbstractProjection.js';
import { ImagePixel } from '../model/ImagePixel.js';
import { FITSParser } from 'jsfitsio';
import { FITSHeader } from 'jsfitsio';
import { FITSHeaderItem } from 'jsfitsio';
import { FITSParsed } from 'jsfitsio';
import { ParseUtils } from 'jsfitsio';
import {Point} from '../model/Point.js';


export class GnomonicProjection extends AbstractProjection {




    _minra: number;
    _mindec: number;
    _pxmatrix;
    _fitsheader: FITSHeader[];
    _inflie: string;
    _craDeg: number;
    _cdecDeg: number;
    _pxsize1: number;
    _pxsize2: number;
    _pxvalues: Map<number, Array<Uint8Array>>;
    _minphysicalval: number;
    _maxphysicalval: number;
    _wcsname: string;

    constructor(infile?: string) {
        super("'RA---TAN'", "'DEC--TAN'");
        if (infile) {
            this._inflie = infile;
        }
    }


    public get fitsUsed(): String[] {
        throw new Error('Method not implemented.');
    }

    async initFromFile(infile: string): Promise<FITSParsed> {

        let fp = new FITSParser(infile);

        let promise = fp.loadFITS().then(fits => {

            // console.log(fits.header);
            this._pxvalues.set(0, fits.data);
            this._fitsheader[0] = fits.header;
            super.naxis1 = fits.header.get("NAXIS1");
            super.naxis2 = fits.header.get("NAXIS2");
            this._craDeg = fits.header.getItemListOf("CRVAL1")[0].value;
            this._cdecDeg = fits.header.getItemListOf("CRVAL2")[0].value;

            // TODO CDELT could not be present. In this is the case, 
            // there should be CDi_ja, but I am not handling them atm
            // [Ref. Representation of celestial coordinates in FITS - equation (1)]
            this._pxsize1 = this._fitsheader[0].getItemListOf("CDELT1")[0].value;
            this._pxsize2 = this._fitsheader[0].getItemListOf("CDELT2")[0].value;

            this._minra = this._craDeg - this._pxsize1 * super.naxis1 / 2;
            if (this._minra < 0) {
                this._minra += 360;
            }
            this._mindec = this._cdecDeg - this._pxsize2 * super.naxis2 / 2;

            return fits;

        });
        await promise;
        return promise;
    }

    extractPhysicalValues(fits: FITSParsed): number[][] {

        let bzero = fits.header.get("BZERO");
        let bscale = fits.header.get("BSCALE");
        let naxis1 = fits.header.get("NAXIS1");
        let naxis2 = fits.header.get("NAXIS2");
        let bitpix = fits.header.get("BITPIX");
        let bytesXelem = Math.abs(bitpix / 8);
        let blankBytes = ParseUtils.convertBlankToBytes(fits.header.get("BLANK"), bytesXelem); // TODO => ??????? Im not using it. it should be used!
        // let physicalvalues = new Array[naxis2][naxis1];
        let physicalvalues: number[][] = new Array<number[]>(naxis2);

        for (let n2 = 0; n2 < naxis2; n2++) {
            physicalvalues[n2] = new Array<number>(naxis1);
            for (let n1 = 0; n1 < naxis1; n1++) {
                let pixval = ParseUtils.extractPixelValue(0, fits.data[n2].slice(n1 * bytesXelem, (n1 + 1) * bytesXelem), bitpix);
                let physicalVal = bzero + bscale * pixval;
                physicalvalues[n2][n1] = physicalVal;
            }
        }
        return physicalvalues;


    }

    prepareFITSHeader(fitsHeaderParams: FITSHeader): FITSHeader[] {

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
        this._fitsheader[0].addItem(new FITSHeaderItem("NAXIS1", super.naxis1));
        this._fitsheader[0].addItem(new FITSHeaderItem("NAXIS2", super.naxis2));

        this._fitsheader[0].addItem(new FITSHeaderItem("CTYPE1", super.ctype1));
        this._fitsheader[0].addItem(new FITSHeaderItem("CTYPE2", super.ctype2));

        this._fitsheader[0].addItem(new FITSHeaderItem("CDELT1", super.pxsize)); // ??? Pixel spacing along axis 1 ???
        this._fitsheader[0].addItem(new FITSHeaderItem("CDELT2", super.pxsize)); // ??? Pixel spacing along axis 2 ???
        this._fitsheader[0].addItem(new FITSHeaderItem("CRPIX1", super.naxis1 / 2)); // central/reference pixel i along naxis1
        this._fitsheader[0].addItem(new FITSHeaderItem("CRPIX2", super.naxis2 / 2)); // central/reference pixel j along naxis2
        this._fitsheader[0].addItem(new FITSHeaderItem("CRVAL1", this._craDeg)); // central/reference pixel RA
        this._fitsheader[0].addItem(new FITSHeaderItem("CRVAL2", this._cdecDeg)); // central/reference pixel Dec

        let min = bzero + bscale * this._minphysicalval;
        let max = bzero + bscale * this._maxphysicalval;
        this._fitsheader[0].addItem(new FITSHeaderItem("DATAMIN", min)); // min data value
        this._fitsheader[0].addItem(new FITSHeaderItem("DATAMAX", max)); // max data value


        this._fitsheader[0].addItem(new FITSHeaderItem("ORIGIN", "WCSLight v.0.x"));
        this._fitsheader[0].addItem(new FITSHeaderItem("COMMENT", "WCSLight v0.x developed by F.Giordano and Y.Ascasibar"));
        this._fitsheader[0].addItem(new FITSHeaderItem("END"));

        return this._fitsheader;

    }

    getFITSHeader(): FITSHeader[] {
        return this._fitsheader;
    }

    getCommonFitsHeaderParams(): FITSHeader {
        let header = new FITSHeader();
        for (const [key, value] of this._fitsheader[0]) {
            // I could add a list of used NPIXs to be included in the comment of the output FITS
            if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER",].includes(key)) {

                // header.set(key, value);
                header.addItem(new FITSHeaderItem(key, value));

            }
        }
        return header;
    }

    async getPixValues(inputPixelsList: ImagePixel[]): Promise<Uint8Array> {

        let promise = new Promise<Uint8Array>((resolve, reject) => {
            try {
                let bytesXelem = Math.abs(this._fitsheader[0].get("BITPIX") / 8);
                let blankBytes = ParseUtils.convertBlankToBytes(this._fitsheader[0].get("BLANK"), bytesXelem);
                let pixcount = inputPixelsList.length;

                let values = new Uint8Array(pixcount * bytesXelem);

                for (let p = 0; p < pixcount; p++) {

                    let imgpx = inputPixelsList[p];
                    // TODO check when input is undefined. atm it puts 0 bur it should be BLANK
                    // TODO why I am getting negative i and j? check world2pix!!!
                    if ((imgpx._j) < 0 || (imgpx._j) >= super.naxis2 ||
                        (imgpx._i) < 0 || (imgpx._i) >= super.naxis1) {
                        for (let b = 0; b < bytesXelem; b++) {
                            values[p * bytesXelem + b] = blankBytes[b];
                        }
                    } else {
                        for (let b = 0; b < bytesXelem; b++) {
                            values[p * bytesXelem + b] = (this._pxvalues.get(0))[imgpx._j][(imgpx._i) * bytesXelem + b];
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

    setPxsValue(values: Uint8Array, fitsHeaderParams: FITSHeader): Map<number, Array<Uint8Array>> {
        // let bytesXelem = Math.abs(fitsHeaderParams.get("BITPIX") / 8);
        // let minpixb = ParseUtils.extractPixelValue(0, values.slice(0, bytesXelem), fitsHeaderParams.get("BITPIX"));
        // let maxpixb = minpixb;

        // let bscale = (fitsHeaderParams.get("BSCALE") !== undefined) ? fitsHeaderParams.get("BSCALE") : 1.0;
        // let bzero = (fitsHeaderParams.get("BZERO") !== undefined) ? fitsHeaderParams.get("BZERO") : 0.0;

        // this._minphysicalval = bzero + bscale * minpixb;
        // this._maxphysicalval = bzero + bscale * maxpixb;
        // this._pxvalues = new Array(this._naxis2);
        // for (let r = 0; r < this._naxis2; r++) {
        //     this._pxvalues[r] = new Uint8Array(this._naxis1 * bytesXelem);
        // }

        // TODO ...
        return null;
    }

    getImageRADecList(center: Point, radius: number, pxsize: number): Array<[number, number]>{

        // let promise = new Promise((resolve, reject) => {
        //     this.computeSquaredNaxes(2 * radius, pxsize); // compute naxis[1, 2]

        //     this._pxsize = pxsize;
        //     this._minra = center.ra - radius;
        //     if (this._minra < 0) {
        //         this._minra += 360;
        //     }
        //     this._mindec = center.dec - radius;

        //     let radeclist = [];
        //     let pra, pdec;

        // TODO ...
        /*
        basing on naxis1 and naxis2 call pix2world!!!
        */



        /*
        

        mindec = center.dec - radius;
        maxdec = center.dec + radius;
        below pixel size should  depend on the distance from the center
        let l =  0;
        let factor = 1;
        
        for (let d = mindec; d < maxdec; d+=pxsize) { <--ERROR the external loop must be over RA
            factor = 1 + 2**l;
            rapxsize = pxsize/factor;
            for (let r = 0; r < 360; r+=rapxsize) {
                radeclist.push(r, d); 
            }
            l++;
        }
        */





        // let cidx = (this._naxis2 / 2 - 1) * this._naxis1 + this._naxis1 / 2;
        // this._cra = radeclist[cidx][0];
        // this._cdec = radeclist[cidx][1];

        // resolve(radeclist);
        // });
        // return promise;
        return null;

    }

    pix2world(i: number, j: number): Point {

        // TODO ...
        let x, y;
        let CDELT1 = this._fitsheader[0].getItemListOf("CDELT1")[0];
        let CDELT2 = this._fitsheader[0].getItemListOf("CDELT2")[0];
        let PC1_1 = this._fitsheader[0].getItemListOf("PC1_1")[0];
        let PC1_2 = this._fitsheader[0].getItemListOf("PC1_2")[0];
        let PC2_1 = this._fitsheader[0].getItemListOf("PC2_1")[0];
        let PC2_2 = this._fitsheader[0].getItemListOf("PC2_2")[0];

        let CD1_1 = this._fitsheader[0].getItemListOf("CD1_1")[0];
        let CD1_2 = this._fitsheader[0].getItemListOf("CD1_2")[0];
        let CD2_1 = this._fitsheader[0].getItemListOf("CD2_1")[0];
        let CD2_2 = this._fitsheader[0].getItemListOf("CD2_2")[0];

        let CRPIX1 = this._fitsheader[0].getItemListOf("CRPIX1")[0];
        let CRPIX2 = this._fitsheader[0].getItemListOf("CRPIX2")[0];


        if (CDELT1 !== undefined && CDELT2 !== undefined &&
            PC1_1 !== undefined && PC1_2 !== undefined &&
            PC2_1 !== undefined && PC2_2 !== undefined
        ) { // if CDELTia and PCi_ja notation
            x = CDELT1 * (PC1_1 * (i - CRPIX1) + PC1_2 * (j - CRPIX2));
            y = CDELT2 * (PC2_1 * (i - CRPIX1) + PC2_2 * (j - CRPIX2));
        } else { // else CDi_ja notation
            x = CD1_1 * (i - CRPIX1) + CD1_2 * (j - CRPIX2);
            y = CD2_1 * (i - CRPIX1) + CD2_2 * (j - CRPIX2);
        }




        // let phi = math.arg(-y / x);
        // let R_theta = Math.sqrt(x * x + y * y);
        // let theta = Math.atan2(180 / (Math.PI * R_theta));

        // let ra, dec;
        // ra = phi;
        // dec = theta;
        // // TODO check if phi, theta match with ra, dec or they need to be (linearly) converted 

        // return [ra, dec];

        return null;
    }

    world2pix(radeclist: number[][]): ImagePixel[] {

        let imgpxlist: ImagePixel[] = [];

        let CDELT1 = (this._fitsheader[0].getItemListOf("CDELT1").length > 0) ? this._fitsheader[0].getItemListOf("CDELT1")[0] : undefined;
        let CDELT2 = (this._fitsheader[0].getItemListOf("CDELT2").length > 0) ? this._fitsheader[0].getItemListOf("CDELT2")[0] : undefined;
        let PC1_1 = (this._fitsheader[0].getItemListOf("PC1_1").length > 0) ? this._fitsheader[0].getItemListOf("PC1_1")[0] : undefined;
        let PC1_2 = (this._fitsheader[0].getItemListOf("PC1_2").length > 0) ? this._fitsheader[0].getItemListOf("PC1_2")[0] : undefined;
        let PC2_1 = (this._fitsheader[0].getItemListOf("PC2_1").length > 0) ? this._fitsheader[0].getItemListOf("PC2_1")[0] : undefined;
        let PC2_2 = (this._fitsheader[0].getItemListOf("PC2_2").length > 0) ? this._fitsheader[0].getItemListOf("PC2_2")[0] : undefined;

        let CD1_1 = (this._fitsheader[0].getItemListOf("CD1_1").length > 0) ? this._fitsheader[0].getItemListOf("CD1_1")[0] : undefined;
        let CD1_2 = (this._fitsheader[0].getItemListOf("CD1_2").length > 0) ? this._fitsheader[0].getItemListOf("CD1_2")[0] : undefined;
        let CD2_1 = (this._fitsheader[0].getItemListOf("CD2_1").length > 0) ? this._fitsheader[0].getItemListOf("CD2_1")[0] : undefined;
        let CD2_2 = (this._fitsheader[0].getItemListOf("CD2_2").length > 0) ? this._fitsheader[0].getItemListOf("CD2_2")[0] : undefined;

        let CRPIX1 = (this._fitsheader[0].getItemListOf("CRPIX1").length > 0) ? this._fitsheader[0].getItemListOf("CRPIX1")[0] : undefined;
        let CRPIX2 = (this._fitsheader[0].getItemListOf("CRPIX2").length > 0) ? this._fitsheader[0].getItemListOf("CRPIX2")[0] : undefined;

        radeclist.forEach(([ra, dec]) => {

            // TODO ...
            // let i, j;
            // // (linearly) convert ra, dec into phi, theta
            // let theta = dec;
            // let phi = ra;
            // let R_theta = (180 / Math.PI) * math.cot(theta);
            // let x = R_theta * Math.sin(phi);
            // let y = - R_theta * Math.cos(phi);
            // if (CDELT1 !== undefined && CDELT2 !== undefined &&
            //     PC1_1 !== undefined && PC1_2 !== undefined &&
            //     PC2_1 !== undefined && PC2_2 !== undefined
            // ) { // if CDELTia and PCi_ja notation
            //     j = y * CDELT1 * PC1_1 / (CDELT1 * CDELT2 * (PC1_1 * PC2_2 - PC2_1 * PC1_2)) + PC1_1 * CRPIX2 * (PC2_2 - PC2_1) / (PC1_1 * PC2_2 - PC2_1 * PC1_2);
            //     i = x / (CDELT1 * PC1_1) + CRPIX1 - j * PC1_2 / PC1_1 + CRPIX2 * PC1_2 / PC1_1;
            // } else { // else CDi_ja notation
            //     j = y * CD1_1 / (CD1_1 * CD2_2 - CD1_2 * CD2_1) + CRPIX2 * CD1_1 * (CD2_2 - CD2_1) / (CD1_1 * CD2_2 - CD1_2 * CD2_1);
            //     i = (x + CD1_1 * CRPIX1 - CD1_2 * j + CD1_2 * CRPIX2) / CD1_1;
            // }
            // imgpxlist.push(new ImagePixel(i, j));

        });
        return imgpxlist;

    }

    // getCanvas2d(tfunction = "linear", colormap = "grayscale", inverse = false) {

    //     let canvas2d = new Canvas2D(this._pxvalues, this._fitsheader, this, tfunction, colormap, inverse);
    //     return canvas2d;
    // }
}
