/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

import {
  FITSParser,
  FITSHeaderManager,
  FITSHeaderItem,
  ParsePayload,
  PrimaryHDU,
} from "jsfitsio";

import { AbstractProjection } from "../AbstractProjection.js";
import { Point } from "../../model/Point.js";
import { CoordsType } from "../../model/CoordsType.js";
import { NumberType } from "../../model/NumberType.js";
import { TilesRaDecList2 } from "../hips/TilesRaDecList2.js";
import { ImagePixel } from "../hips/ImagePixel.js";
import { FITS } from "../../model/FITS.js";

import { APP_VERSION } from "../../Version.js"; // adjust path as needed
import { FITSUtils } from "../../utils/FITSUtils.js";

// import { HiPSProp } from '../hips/HiPSProp.js';

export class CartesianProjection extends AbstractProjection {
  minra!: number;
  mindec!: number;
  naxis1!: number;
  naxis2!: number;
  bitpix!: number;

  fitsheader: FITSHeaderManager;
  pxvalues: Array<Uint8Array>;

  CTYPE1: string = "'RA---CAR'";
  CTYPE2: string = "'DEC--CAR'";
  craDeg!: number;
  cdecDeg!: number;

  pxsize!: number;
  pxsize1!: number;
  pxsize2!: number;

  _wcsname: string;

  constructor() {
    super();
    this._wcsname = "CAR"; // TODO check WCS standard and create ENUM
    this.pxvalues = new Array<Uint8Array>();
    this.fitsheader = new FITSHeaderManager();
  }

  async initFromFile(infile: string): Promise<PrimaryHDU> {
    const fitsFile = await FITSParser.loadFITSFile(infile);
    const fits = fitsFile?.primaryHDU;

    if (!fits) {
      throw new Error(`Unable to load FITS file: ${infile}`);
    }

    if (fits.naxis !== 2) {
      throw new Error(
        `CartesianProjection requires a 2D FITS image, got NAXIS=${fits.naxis}`,
      );
    }

    this.pxvalues = this.createRawRows(fits);
    this.fitsheader = fits.header;
    this.naxis1 = fits.shape[0] ?? 0;
    this.naxis2 = fits.shape[1] ?? 0;
    this.bitpix = fits.bitpix;
    this.craDeg = fits.header.findById("CRVAL1")?.value as number;
    this.cdecDeg = fits.header.findById("CRVAL2")?.value as number;
    const pxsize1 = this.fitsheader.findById("CDELT1")?.value as number;
    const pxsize2 = this.fitsheader.findById("CDELT2")?.value as number;

    if (pxsize1 !== pxsize2 || pxsize1 === undefined || pxsize2 === undefined) {
      throw new Error("pxsize1 is not equal to pxsize2");
    }
    this.pxsize = pxsize1;
    this.minra = this.craDeg - (this.pxsize * this.naxis1) / 2;
    if (this.minra < 0) {
      this.minra += 360;
    }
    this.mindec = this.cdecDeg - (this.pxsize * this.naxis2) / 2;

    return fits;
  }

  getBytePerValue(): number {
    return Math.abs(this.bitpix / 8);
  }

  extractPhysicalValues(fits: PrimaryHDU): number[][] {
    if (fits.rawData === null) {
      throw new Error("FITS image does not contain a payload");
    }

    const bzero = Number(fits.header.findById("BZERO")?.value ?? 0);
    const bscale = Number(fits.header.findById("BSCALE")?.value ?? 1);
    const naxis1 = fits.shape[0] ?? 0;
    const naxis2 = fits.shape[1] ?? 0;
    const bitpix = fits.bitpix;
    const bytesPerElement = Math.abs(bitpix) / 8;
    const physicalValues = new Array<number[]>(naxis2);

    for (let row = 0; row < naxis2; row++) {
      physicalValues[row] = new Array<number>(naxis1);

      for (let column = 0; column < naxis1; column++) {
        const elementIndex = row * naxis1 + column;

        const byteOffset = elementIndex * bytesPerElement;

        const pixelValue = ParsePayload.extractPixelValue(
          fits.rawData,
          byteOffset,
          bitpix,
        );

        physicalValues[row][column] = bzero + bscale * pixelValue;
      }
    }
    return physicalValues;
  }

  prepareHeader(
    pixelAngSize: number,
    BITPIX: number,
    TILE_WIDTH: number,
    BLANK: number,
    BZERO: number,
    BSCALE: number,
    cRA: number,
    cDec: number,
    minValue: number,
    maxValue: number,
  ): FITSHeaderManager {
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

    fitsheader.insert(
      new FITSHeaderItem("ORIGIN", `WCSLight v.${APP_VERSION}`, ""),
    );
    fitsheader.insert(
      new FITSHeaderItem(
        "COMMENT",
        "WCSLight developed by F.Giordano and Y.Ascasibar",
        "",
      ),
    );
    fitsheader.insert(new FITSHeaderItem("END", "", ""));

    return fitsheader;
  }

  // TODO CHECK: there are 4 header related methods!!! prepareHeader, prepareFITSHeader, getCommonFitsHeaderParams and getFITSHeader
  getFITSHeader(): FITSHeaderManager {
    return this.fitsheader;
  }
  // TODO CHECK: there are 4 header related methods!!! prepareHeader, prepareFITSHeader, getCommonFitsHeaderParams and getFITSHeader
  getCommonFitsHeaderParams(): FITSHeaderManager {
    let header = new FITSHeaderManager();
    for (const item of this.fitsheader.getItems()) {
      const key = item.key;
      if (
        ["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER"].includes(key)
      ) {
        const value = item.value;
        header.insert(new FITSHeaderItem(key, value, ""));
      }
    }
    return header;
  }

  computeNaxisWidth(radius: number, pxsize: number): number {
    return Math.ceil((2 * radius) / pxsize);
  }

  getImageRADecList(
    center: Point,
    radius: number,
    pxsize: number,
    naxisWidth: number,
  ): TilesRaDecList2 {
    const naxis1 = naxisWidth;
    const naxis2 = naxis1;

    let minra = center.getAstro().raDeg - radius;
    if (minra < 0) {
      minra += 360;
    }
    const mindec = center.getAstro().decDeg - radius;

    const tilesRaDecList = new TilesRaDecList2();

    // let radeclist: Array<[number, number]> = new Array<[number, number]>();

    // let centralRa, centralDec
    for (let d = 0; d < naxis2; d++) {
      for (let r = 0; r < naxis1; r++) {
        tilesRaDecList.addImagePixel(
          new ImagePixel(minra + r * pxsize, mindec + d * pxsize, undefined),
        );
        // radeclist.push([minra + (r * pxsize), mindec + (d * pxsize)]);
      }
    }

    const centralImgpx = tilesRaDecList.getImagePixelList().length / 2 - 1;
    // let cidx = (naxis2 / 2) * naxis1 + naxis1 / 2;
    // if (naxis1 % 2 != 0) {
    //     cidx = Math.floor(radeclist.length / 2);
    // }
    // this._craDeg = radeclist[cidx][0];
    // this._cdecDeg = radeclist[cidx][1];

    // return radeclist
    return tilesRaDecList;
  }

  /** TODO !!! check and handle RA passing through 360-0 */
  pix2world(
    i: number,
    j: number,
    pxsize: number,
    minra: number,
    mindec: number,
  ): Point {
    let ra: number;
    let dec: number;
    // ra = i * this._stepra + this._minra;
    // dec = j * this._stepdec + this._mindec;
    ra = i * pxsize + minra;
    dec = j * pxsize + mindec;
    let p = new Point(CoordsType.ASTRO, NumberType.DEGREES, ra, dec);
    return p;
    // return [ra, dec];
  }

  setPixelValues(raDecList: TilesRaDecList2, header: FITSHeaderManager): FITS {
    const BITPIX = header.findById("BITPIX")?.value as number;
    if (!Number.isFinite(BITPIX)) {
      throw new Error("BITPIX not found or invalid in header");
    }
    const bytesPerElem = Math.abs(BITPIX) / 8;

    const width = header.findById("NAXIS1")?.value as number;
    const height = (header.findById("NAXIS2")?.value as number) ?? width; // fallback if square
    if (!Number.isFinite(width) || width <= 0)
      throw new Error("NAXIS1 not found or invalid");
    if (!Number.isFinite(height) || height <= 0)
      throw new Error("NAXIS2 not found or invalid");
    const BLANK = Number(header.findById("BLANK")?.value ?? 0);
    const blankBytes = FITSUtils.convertBlankToBytes(BLANK, bytesPerElem);

    const pixels = raDecList.getImagePixelList();
    if (pixels.length !== width * height) {
      throw new Error(
        `Pixel count mismatch: got ${pixels.length}, expected ${width * height}`,
      );
    }

    // Map<rowIndex, Uint8Array[]>, each row has length = width
    const pxvalues = new Map<number, Uint8Array[]>();
    for (let r = 0; r < height; r++) {
      pxvalues.set(r, new Array<Uint8Array>(width));
    }

    // Fill in row-major order: for each linear index, compute (row, col)
    for (let idx = 0; idx < pixels.length; idx++) {
      const row = Math.floor(idx / width);
      const col = idx % width;

      const rowArr = pxvalues.get(row)!;

      let u8 = pixels[idx].getUint8Value();
      if (u8 == null) {
        u8 = blankBytes.slice(0);
        pixels[idx].setValue(u8, BITPIX);
      }
      if (u8.byteLength !== bytesPerElem) {
        throw new Error(
          `Pixel (${row},${col}) byteLength=${u8.byteLength} != expected ${bytesPerElem} (BITPIX=${BITPIX})`,
        );
      }

      rowArr[col] = u8;
      // no need to pxvalues.set(row, rowArr); reference already updated
    }

    return new FITS(header, pxvalues);
  }

  generateFITSFile(
    pixelAngSize: number,
    BITPIX: number,
    TILE_WIDTH: number,
    BLANK: number,
    BZERO: number,
    BSCALE: number,
    cRA: number,
    cDec: number,
    minValue: number,
    maxValue: number,
    raDecWithValues: TilesRaDecList2,
  ): FITS {
    const header: FITSHeaderManager = this.prepareHeader(
      pixelAngSize,
      BITPIX,
      TILE_WIDTH,
      BLANK,
      BZERO,
      BSCALE,
      cRA,
      cDec,
      minValue,
      maxValue,
    );
    const fits: FITS = this.setPixelValues(raDecWithValues, header);
    return fits;
  }

  world2pix(raDecList: TilesRaDecList2): TilesRaDecList2 {
    const bytesXvalue = this.getBytePerValue();

    // TODO if I have the this.fitsheader available here, check if I can retrieve this.bitpix, this.pxsize, ... with this.fitsheader
    // and remove the attributes at object level (with this)
    const blank = Number(this.fitsheader.findById("BLANK")?.value);
    const blankBytes = FITSUtils.convertBlankToBytes(blank, bytesXvalue);

    for (let imgPx of raDecList.getImagePixelList()) {
      // console.log("raDeclist.getImagePixelList().indexOf(imgPx) " + raDeclist.getImagePixelList().indexOf(imgPx))
      const ra = imgPx.getRADeg();
      const dec = imgPx.getDecDeg();

      const i = Math.floor((ra - this.minra) / this.pxsize);
      const j = Math.floor((dec - this.mindec) / this.pxsize);

      if (j < 0 || j >= this.naxis2 || i < 0 || i >= this.naxis1) {
        imgPx.setValue(blankBytes, this.bitpix);
      } else {
        const currentValue = this.pxvalues[j].slice(
          i * bytesXvalue,
          (i + 1) * bytesXvalue,
        );
        imgPx.setValue(currentValue, this.bitpix);
      }
      raDecList.setMinMaxValue(imgPx.getValue());
    }
    return raDecList;
  }

  private createRawRows(fits: PrimaryHDU): Array<Uint8Array> {
    if (fits.rawData === null) {
      return [];
    }

    const naxis1 = fits.shape[0] ?? 0;
    const naxis2 = fits.shape[1] ?? 0;
    const bytesPerElement = Math.abs(fits.bitpix) / 8;
    const rowByteLength = naxis1 * bytesPerElement;
    const rows: Array<Uint8Array> = new Array<Uint8Array>(naxis2);

    for (let row = 0; row < naxis2; row++) {
      const start = row * rowByteLength;
      const end = start + rowByteLength;
      rows[row] = fits.rawData.subarray(start, end);
    }
    return rows;
  }
}
