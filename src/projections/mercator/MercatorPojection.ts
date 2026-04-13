/**
 * Mercator projection (RA---MER / DEC--MER)
 *
 * Implements AbstractProjection with Mercator forward/inverse transforms.
 * Vertical coordinate is Mercator-projected Y in degrees.
 *
 * @author Fabrizio
 */

import { FITSParser, FITSHeaderManager, FITSHeaderItem, FITSParsed, ParseUtils } from 'jsfitsio';
import { AbstractProjection } from '../AbstractProjection.js';
import { Point } from '../../model/Point.js';
import { CoordsType } from '../../model/CoordsType.js';
import { NumberType } from '../../model/NumberType.js';
import { TilesRaDecList2 } from '../hips/TilesRaDecList2.js';
import { ImagePixel } from '../hips/ImagePixel.js';
import { FITS } from '../../model/FITS.js';
import { APP_VERSION } from '../../Version.js';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const MAX_MERC_LAT = 85.0;

/** Forward Mercator: y(deg) from latitude φ(deg) */
function mercatorYdegFromLatDeg(phiDeg: number): number {
    const clamped = Math.max(-MAX_MERC_LAT, Math.min(MAX_MERC_LAT, phiDeg));
    const phi = clamped * DEG2RAD;
    const y = Math.log(Math.tan(Math.PI / 4 + phi / 2));
    return y * RAD2DEG;
}

/** Inverse Mercator: latitude φ(deg) from y(deg) */
function latDegFromMercatorYdeg(yDeg: number): number {
    const y = yDeg * DEG2RAD;
    const phi = 2 * Math.atan(Math.exp(y)) - Math.PI / 2;
    const phiDeg = phi * RAD2DEG;
    return Math.max(-MAX_MERC_LAT, Math.min(MAX_MERC_LAT, phiDeg));
}

export class MercatorProjection extends AbstractProjection {
    minra!: number;
    mindec!: number;  // actually stores minYdeg
    naxis1!: number;
    naxis2!: number;
    bitpix!: number;

    fitsheader: FITSHeaderManager;
    pxvalues: Array<Uint8Array>;

    CTYPE1 = "'RA---MER'";
    CTYPE2 = "'DEC--MER'";
    craDeg!: number;
    cdecDeg!: number;
    pxsize!: number;
    _wcsname: string;

    constructor() {
        super();
        this._wcsname = "MER";
        this.pxvalues = [];
        this.fitsheader = new FITSHeaderManager();
    }

    /** ----------------------------------------------------------------------
     * Required implementations of AbstractProjection
     * ---------------------------------------------------------------------- */

    async initFromFile(infile: string): Promise<FITSParsed> {
        const fits = await FITSParser.loadFITS(infile);
        if (!fits) throw new Error("FITS is null");

        this.pxvalues = fits.data;
        this.fitsheader = fits.header;

        this.naxis1 = Number(fits.header.findById("NAXIS1")?.value);
        this.naxis2 = Number(fits.header.findById("NAXIS2")?.value);
        this.bitpix = Number(fits.header.findById("BITPIX")?.value);

        this.craDeg = Number(fits.header.findById("CRVAL1")?.value);
        this.cdecDeg = Number(fits.header.findById("CRVAL2")?.value);

        const pxsize1 = Number(fits.header.findById("CDELT1")?.value);
        const pxsize2 = Number(fits.header.findById("CDELT2")?.value);
        if (pxsize1 !== pxsize2 || isNaN(pxsize1) || isNaN(pxsize2)) {
            throw new Error("Invalid or inconsistent CDELT1/CDELT2");
        }
        this.pxsize = pxsize1;

        this.minra = this.craDeg - this.pxsize * this.naxis1 / 2;
        if (this.minra < 0) this.minra += 360;

        const cYdeg = mercatorYdegFromLatDeg(this.cdecDeg);
        this.mindec = cYdeg - this.pxsize * this.naxis2 / 2;

        return fits;
    }

    getBytePerValue(): number {
        return Math.abs(this.bitpix / 8);
    }

    getFITSHeader(): FITSHeaderManager {
        return this.fitsheader;
    }

    getCommonFitsHeaderParams(): FITSHeaderManager {
        const header = new FITSHeaderManager();
        for (const item of this.fitsheader.getItems()) {
            const key = item.key;
            if (["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER"].includes(key)) {
                header.insert(new FITSHeaderItem(key, item.value, ""));
            }
        }
        return header;
    }

    getImageRADecList(
        center: Point,
        radius: number,
        pxsize: number,
        naxisWidth: number
    ): TilesRaDecList2 {
        const naxis1 = naxisWidth;
        const naxis2 = naxisWidth;

        let minra = center.getAstro().raDeg - radius;
        if (minra < 0) minra += 360;

        const cYdeg = mercatorYdegFromLatDeg(center.getAstro().decDeg);
        const minYdeg = cYdeg - radius;

        const tilesRaDecList = new TilesRaDecList2();

        for (let j = 0; j < naxis2; j++) {
            const yDeg = minYdeg + j * pxsize;
            const dec = latDegFromMercatorYdeg(yDeg);
            for (let i = 0; i < naxis1; i++) {
                let ra = minra + i * pxsize;
                if (ra >= 360) ra -= 360;
                tilesRaDecList.addImagePixel(new ImagePixel(ra, dec, undefined));
            }
        }
        return tilesRaDecList;
    }

    computeNaxisWidth(radius: number, pxsize: number): number {
        return Math.ceil(2 * radius / pxsize);
    }

    pix2world(i: number, j: number, pxsize: number, minra: number, mindec: number): Point {
        const ra = i * pxsize + minra;
        const yDeg = j * pxsize + mindec;
        const dec = latDegFromMercatorYdeg(yDeg);
        return new Point(CoordsType.ASTRO, NumberType.DEGREES, ra, dec);
    }

    world2pix(raDecList: TilesRaDecList2): TilesRaDecList2 {
        const bytesXvalue = this.getBytePerValue();
        const blank = Number(this.fitsheader.findById("BLANK")?.value);
        const blankBytes = ParseUtils.convertBlankToBytes(blank, bytesXvalue);

        for (const imgPx of raDecList.getImagePixelList()) {
            const ra = imgPx.getRADeg();
            const dec = imgPx.getDecDeg();
            const yDeg = mercatorYdegFromLatDeg(dec);

            const i = Math.floor((ra - this.minra) / this.pxsize);
            const j = Math.floor((yDeg - this.mindec) / this.pxsize);
            imgPx.setij(i, j);

            if (j < 0 || j >= this.naxis2 || i < 0 || i >= this.naxis1) {
                imgPx.setValue(blankBytes, this.bitpix);
            } else {
                const currentValue = this.pxvalues[j].slice(
                    i * bytesXvalue,
                    (i + 1) * bytesXvalue
                );
                imgPx.setValue(currentValue, this.bitpix);
            }

            raDecList.setMinMaxValue(imgPx.getValue());
        }

        return raDecList;
    }

    // And keep generateFITSFile(...) returning a FITS instance (not an object literal)
    generateFITSFile(
        pixelAngSize: number,
        BITPIX: number,
        TILE_WIDTH: number,
        BLANK: number, BZERO: number, BSCALE: number,
        cRA: number, cDec: number,
        minValue: number, maxValue: number,
        raDecWithValues: TilesRaDecList2
    ): FITS {
        const header: FITSHeaderManager = this.prepareHeader(
            pixelAngSize,
            BITPIX,
            TILE_WIDTH,
            BLANK, BZERO, BSCALE,
            cRA, cDec,
            minValue, maxValue
        );
        return this.setPixelValues(raDecWithValues, header);
    }


    /** ----------------------------------------------------------------------
     * FITS header & data handling
     * ---------------------------------------------------------------------- */

    prepareHeader(
        pixelAngSize: number,
        BITPIX: number,
        TILE_WIDTH: number,
        BLANK: number, BZERO: number, BSCALE: number,
        cRA: number, cDec: number,
        minValue: number, maxValue: number
    ): FITSHeaderManager {
        const fitsheader = new FITSHeaderManager();

        fitsheader.insert(new FITSHeaderItem("SIMPLE", "T", ""));
        fitsheader.insert(new FITSHeaderItem("NAXIS", 2, ""));
        fitsheader.insert(new FITSHeaderItem("NAXIS1", TILE_WIDTH, ""));
        fitsheader.insert(new FITSHeaderItem("NAXIS2", TILE_WIDTH, ""));
        fitsheader.insert(new FITSHeaderItem("BITPIX", BITPIX, ""));
        fitsheader.insert(new FITSHeaderItem("BLANK", BLANK, ""));
        fitsheader.insert(new FITSHeaderItem("BSCALE", BSCALE, ""));
        fitsheader.insert(new FITSHeaderItem("BZERO", BZERO, ""));
        fitsheader.insert(new FITSHeaderItem("CTYPE1", this.CTYPE1, ""));
        fitsheader.insert(new FITSHeaderItem("CTYPE2", this.CTYPE2, ""));
        fitsheader.insert(new FITSHeaderItem("CDELT1", pixelAngSize, ""));
        fitsheader.insert(new FITSHeaderItem("CDELT2", pixelAngSize, ""));
        fitsheader.insert(new FITSHeaderItem("CRPIX1", TILE_WIDTH / 2, ""));
        fitsheader.insert(new FITSHeaderItem("CRPIX2", TILE_WIDTH / 2, ""));
        fitsheader.insert(new FITSHeaderItem("CRVAL1", cRA, ""));
        fitsheader.insert(new FITSHeaderItem("CRVAL2", cDec, ""));
        fitsheader.insert(new FITSHeaderItem("DATAMIN", BZERO + BSCALE * minValue, ""));
        fitsheader.insert(new FITSHeaderItem("DATAMAX", BZERO + BSCALE * maxValue, ""));
        fitsheader.insert(new FITSHeaderItem("ORIGIN", `WCSLight v.${APP_VERSION}`, ""));
        fitsheader.insert(new FITSHeaderItem("COMMENT", "WCSLight developed by F.Giordano and Y.Ascasibar", ""));
        fitsheader.insert(new FITSHeaderItem("END", "", ""));
        return fitsheader;
    }

    setPixelValues(raDecList: TilesRaDecList2, header: FITSHeaderManager): FITS {
        const BITPIX = Number(header.findById("BITPIX")?.value);
        if (!Number.isFinite(BITPIX)) throw new Error("BITPIX not found or invalid in header");
        const bytesPerElem = Math.abs(BITPIX) / 8;

        const width = Number(header.findById("NAXIS1")?.value);
        const height = Number(header.findById("NAXIS2")?.value);
        if (!Number.isFinite(width) || width <= 0) throw new Error("NAXIS1 not found or invalid");
        if (!Number.isFinite(height) || height <= 0) throw new Error("NAXIS2 not found or invalid");

        const BLANK = Number(header.findById("BLANK")?.value);
        const blankBytes = ParseUtils.convertBlankToBytes(BLANK, bytesPerElem);

        const pixels = raDecList.getImagePixelList();
        if (pixels.length !== width * height) {
            throw new Error(`Pixel count mismatch: got ${pixels.length}, expected ${width * height}`);
        }

        // Build Map<rowIndex, Array<Uint8Array>> where each inner array contains per-pixel byte arrays
        const rowsMap = new Map<number, Array<Uint8Array>>();
        for (let j = 0; j < height; j++) {
            rowsMap.set(j, new Array<Uint8Array>(width));
        }

        for (let k = 0; k < pixels.length; k++) {
            const row = Math.floor(k / width);
            const col = k % width;
            const u8 = pixels[k].getUint8Value();

            // Ensure each cell gets its own buffer (avoid sharing the same BLANK buffer)
            rowsMap.get(row)![col] = u8 ? u8 : new Uint8Array(blankBytes);
        }

        // Return your FITS class instance
        return new FITS(header, rowsMap);
    }


}
