import {
  FITSHeaderItem,
  FITSHeaderManager,
  FITSParser,
  ParsePayload,
  PrimaryHDU,
} from "jsfitsio";

import { Healpix } from "astrospatial-core/healpix";

import { HiPSIntermediateProj } from "./HiPSIntermediateProj.js";
import { HEALPixXYSpace } from "../../model/HEALPixXYSpace.js";
import { fillAstro, radToDeg } from "../../model/Utils.js";
import { NumberType } from "../../model/NumberType.js";
import { HiPSHelper } from "../HiPSHelper.js";
import { HiPSProperties } from "./HiPSProperties.js";
import { ImagePixel } from "./ImagePixel.js";
import { APP_VERSION } from "../../Version.js";

export class HiPSFITS {
  private payload: Array<Uint8Array> = [];

  private header!: FITSHeaderManager;

  private tileno!: number;

  private order!: number;

  private tileWidth!: number;

  private healpix!: Healpix;

  private intermediateXYGrid!: HEALPixXYSpace;

  private min: number = NaN;

  private max: number = NaN;

  private static CTYPE1 = "RA---HPX";

  private static CTYPE2 = "DEC--HPX";

  private static NPIX = "NPIX";

  constructor(
    fits: PrimaryHDU | null,
    tileno: number | null,
    hipsProp: HiPSProperties | null,
  ) {
    if (fits) {
      this.initFromPrimaryHDU(fits);
      return;
    }

    if (tileno === null || hipsProp === null) {
      throw new Error("tileno or hipsProp are not defined");
    }

    this.order = Number(hipsProp.getItem(HiPSProperties.ORDER));

    const naxis1 = Number(hipsProp.getItem(HiPSProperties.TILE_WIDTH));

    const naxis2 = Number(hipsProp.getItem(HiPSProperties.TILE_WIDTH));

    this.tileno = tileno;

    if (!Number.isFinite(this.order)) {
      throw new Error("HiPS ORDER is not defined");
    }

    if (!Number.isFinite(naxis1) || !Number.isFinite(naxis2)) {
      throw new Error("HiPS TILE_WIDTH is not defined");
    }

    if (naxis1 !== naxis2) {
      throw new Error("NAXIS1 and NAXIS2 do not match.");
    }

    this.tileWidth = naxis1;

    this.healpix = HiPSHelper.getHelpixByOrder(this.order);

    this.intermediateXYGrid = HiPSIntermediateProj.setupByTile(
      this.tileno,
      this.healpix,
    );
  }

  initFromUint8Array(
    imagePixelList: ImagePixel[],
    fitsHeaderParams: FITSHeaderManager,
    tileWidth: number,
  ): void {
    this.setPayload(imagePixelList, fitsHeaderParams, tileWidth);

    this.setHeader(fitsHeaderParams);
  }

  getPayload(): Array<Uint8Array> {
    return this.payload;
  }

  private createRawRows(fits: PrimaryHDU): Array<Uint8Array> {
    if (fits.rawData === null) {
      return [];
    }

    const naxis1 = fits.shape[0] ?? 0;

    const naxis2 = fits.shape[1] ?? 0;

    const bytesPerElement = Math.abs(fits.bitpix) / 8;

    const rowByteLength = naxis1 * bytesPerElement;

    const rows = new Array<Uint8Array>(naxis2);

    for (let row = 0; row < naxis2; row++) {
      const start = row * rowByteLength;

      rows[row] = fits.rawData.subarray(start, start + rowByteLength);
    }

    return rows;
  }

  initFromPrimaryHDU(fits: PrimaryHDU): void {
    if (fits.naxis !== 2) {
      throw new Error(
        `HiPSFITS requires a 2D FITS image, got NAXIS=${fits.naxis}`,
      );
    }

    this.payload = this.createRawRows(fits);

    this.order = Number(fits.header.findById(HiPSProperties.ORDER)?.value);

    const naxis1 = fits.shape[0] ?? 0;

    const naxis2 = fits.shape[1] ?? 0;

    this.tileno = Number(fits.header.findById(HiPSFITS.NPIX)?.value);

    if (
      !Number.isFinite(this.order) ||
      !Number.isFinite(naxis1) ||
      !Number.isFinite(naxis2) ||
      !Number.isFinite(this.tileno)
    ) {
      throw new Error("ORDER, NAXIS1, NAXIS2 or NPIX not defined");
    }

    if (naxis1 !== naxis2) {
      throw new Error("NAXIS1 and NAXIS2 do not match.");
    }

    this.tileWidth = naxis1;

    this.healpix = HiPSHelper.getHelpixByOrder(this.order);

    this.intermediateXYGrid = HiPSIntermediateProj.setupByTile(
      this.tileno,
      this.healpix,
    );

    this.computeMinMax(fits);

    /*
     * Rebuild the header using the loaded FITS metadata
     * plus the HPX WCS derived from this tile geometry.
     */
    this.setHeader(fits.header);
  }

  getTileno(): number {
    return this.tileno;
  }

  private computeMinMax(fits: PrimaryHDU): void {
    if (fits.rawData === null) {
      return;
    }

    this.min = NaN;

    this.max = NaN;

    const bitpix = fits.bitpix;

    const bzero = Number(
      fits.header.findById(FITSHeaderManager.BZERO)?.value ?? 0,
    );

    const bscale = Number(
      fits.header.findById(FITSHeaderManager.BSCALE)?.value ?? 1,
    );

    const naxis1 = fits.shape[0] ?? 0;

    const naxis2 = fits.shape[1] ?? 0;

    const bytesPerElement = Math.abs(bitpix) / 8;

    const pixelCount = naxis1 * naxis2;

    for (let index = 0; index < pixelCount; index++) {
      const byteOffset = index * bytesPerElement;

      const rawValue = ParsePayload.extractPixelValue(
        fits.rawData,
        byteOffset,
        bitpix,
      );

      const physicalValue = bzero + bscale * rawValue;

      if (Number.isNaN(this.min) || physicalValue < this.min) {
        this.min = physicalValue;
      }

      if (Number.isNaN(this.max) || physicalValue > this.max) {
        this.max = physicalValue;
      }
    }
  }

  static async downloadFITSFile(path: string): Promise<PrimaryHDU | null> {
    const fitsFile = await FITSParser.loadFITSFile(path);

    const primary = fitsFile?.primaryHDU ?? null;

    if (!primary) {
      console.warn(`fits ${path} doesn't exist`);

      return null;
    }

    return primary;
  }

  getHeader(): FITSHeaderManager {
    return this.header;
  }

  private setPayload(
    imagePixelList: ImagePixel[],
    fitsHeaderParams: FITSHeaderManager,
    tileWidth: number,
  ): void {
    const bitpix = Number(
      fitsHeaderParams.findById(FITSHeaderManager.BITPIX)?.value,
    );

    const bzero = Number(
      fitsHeaderParams.findById(FITSHeaderManager.BZERO)?.value ?? 0,
    );

    const bscale = Number(
      fitsHeaderParams.findById(FITSHeaderManager.BSCALE)?.value ?? 1,
    );

    const bytesXelem = Math.abs(bitpix) / 8;

    if (
      !Number.isFinite(bitpix) ||
      !Number.isInteger(bytesXelem) ||
      bytesXelem <= 0
    ) {
      throw new Error("BITPIX not defined or invalid");
    }

    this.min = NaN;

    this.max = NaN;

    this.payload = new Array<Uint8Array>(tileWidth);

    for (let row = 0; row < tileWidth; row++) {
      this.payload[row] = new Uint8Array(tileWidth * bytesXelem);
    }

    imagePixelList.forEach((imgpx) => {
      const ra = imgpx.getRADeg();

      const dec = imgpx.getDecDeg();

      if (!Number.isFinite(ra) || !Number.isFinite(dec)) {
        return;
      }

      const ac = fillAstro(ra, dec, NumberType.DEGREES);

      if (ac === null) {
        return;
      }

      const [x, y] = HiPSIntermediateProj.world2intermediate(ac);

      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
      }

      const [col, row] = HiPSIntermediateProj.intermediate2pix(
        x,
        y,
        this.intermediateXYGrid,
        tileWidth,
      );

      if (row < 0 || row >= tileWidth || col < 0 || col >= tileWidth) {
        return;
      }

      const valueBytes = imgpx.getUint8Value();

      if (!valueBytes) {
        return;
      }

      for (let b = 0; b < bytesXelem; b++) {
        this.payload[row][col * bytesXelem + b] = valueBytes[b];
      }

      const rawValue = ParsePayload.extractPixelValue(valueBytes, 0, bitpix);

      const physicalValue = bzero + bscale * rawValue;

      if (Number.isNaN(this.min) || physicalValue < this.min) {
        this.min = physicalValue;
      }

      if (Number.isNaN(this.max) || physicalValue > this.max) {
        this.max = physicalValue;
      }
    });
  }

  private addMandatoryItemToHeader(
    key: string,
    fitsHeaderParams: FITSHeaderManager,
  ): void {
    const value = fitsHeaderParams.findById(key)?.value;

    if (value === undefined || value === null) {
      throw new Error(`${key} is not defined`);
    }

    this.header.insert(new FITSHeaderItem(key, value, ""));
  }

  private addItemToHeader(
    key: string,
    fitsHeaderParams: FITSHeaderManager,
  ): void {
    const value = fitsHeaderParams.findById(key)?.value;

    if (value !== undefined && value !== null) {
      this.header.insert(new FITSHeaderItem(key, value, ""));
    }
  }

  private setHeader(fitsHeaderParams: FITSHeaderManager): void {
    this.header = new FITSHeaderManager();

    this.addMandatoryItemToHeader(FITSHeaderManager.SIMPLE, fitsHeaderParams);

    this.addMandatoryItemToHeader(FITSHeaderManager.BITPIX, fitsHeaderParams);

    this.addItemToHeader(FITSHeaderManager.BLANK, fitsHeaderParams);

    this.addItemToHeader(FITSHeaderManager.BSCALE, fitsHeaderParams);

    this.addItemToHeader(FITSHeaderManager.BZERO, fitsHeaderParams);

    this.header.insert(new FITSHeaderItem(FITSHeaderManager.NAXIS, 2, ""));

    this.header.insert(
      new FITSHeaderItem(FITSHeaderManager.NAXIS1, this.tileWidth, ""),
    );

    this.header.insert(
      new FITSHeaderItem(FITSHeaderManager.NAXIS2, this.tileWidth, ""),
    );

    if (Number.isFinite(this.min)) {
      this.header.insert(
        new FITSHeaderItem(FITSHeaderManager.DATAMIN, this.min, ""),
      );
    }

    if (Number.isFinite(this.max)) {
      this.header.insert(
        new FITSHeaderItem(FITSHeaderManager.DATAMAX, this.max, ""),
      );
    }

    this.header.insert(
      new FITSHeaderItem(HiPSProperties.ORDER, this.order, ""),
    );

    this.header.insert(new FITSHeaderItem(HiPSFITS.NPIX, this.tileno, ""));

    /*
     * Build a standards-compatible HPX WCS
     * describing this tile in the global
     * HEALPix projection plane.
     */
    this.addHPXWCS();

    this.header.insert(
      new FITSHeaderItem(
        FITSHeaderManager.ORIGIN,
        `WCSLight v.${APP_VERSION}`,
        "",
      ),
    );

    /*
     * COMMENT/HISTORY serialization belongs
     * to jsfitsio.
     *
     * Do not add COMMENT here until jsfitsio
     * correctly supports FITS commentary cards.
     */

    this.header.insert(new FITSHeaderItem("END", "", ""));
  }

  private addHPXWCS(): void {
    /*
     * A HiPS FITS tile is a square sampling of one
     * HEALPix NESTED cell in the global HPX projection.
     *
     * The WCS celestial reference remains the standard
     * HPX reference:
     *
     *   CRVAL1 = 0
     *   CRVAL2 = 0
     *
     * The location of the tile in the global HPX plane
     * is therefore encoded in CRPIX.
     *
     * Rather than reconstructing the HPX facet position
     * manually from face-local NESTED coordinates, use
     * the public HEALPix API to obtain the actual
     * spherical centre of the tile and project that
     * centre onto the standard HPX intermediate plane.
     */

    const scale = 45 / (this.tileWidth * Math.pow(2, this.order));

    /*
     * HEALPix centre of this NESTED pixel.
     *
     * pix2ang() returns:
     *
     *   theta = colatitude [0, pi]
     *   phi   = longitude  [0, 2pi)
     */
    const pointing = this.healpix.pix2ang(this.tileno);

    const raDeg = radToDeg(pointing.phi);

    const decDeg = 90 - radToDeg(pointing.theta);

    const astro = fillAstro(raDeg, decDeg, NumberType.DEGREES);

    if (!astro) {
      throw new Error(
        `Unable to compute HEALPix centre for ` +
          `order=${this.order}, NPIX=${this.tileno}`,
      );
    }

    /*
     * Convert the spherical HEALPix centre to the
     * standard HPX intermediate projection plane.
     */
    let [xCenter, yCenter] = HiPSIntermediateProj.world2intermediate(astro);

    /*
     * HPX longitude is periodic.
     *
     * Select a local branch in (-180, 180], while
     * deliberately preserving +180 rather than mapping
     * it to -180.
     *
     * Although +180 and -180 represent the same celestial
     * longitude, they are not interchangeable when choosing
     * the local branch of the HPX intermediate projection
     * plane for a tile crossing that meridian.
     *
     * Examples:
     *
     *   180 deg -> +180 deg
     *   270 deg ->  -90 deg
     */
    xCenter = ((xCenter % 360) + 360) % 360;

    if (xCenter > 180) {
      xCenter -= 360;
    }

    if (!Number.isFinite(xCenter) || !Number.isFinite(yCenter)) {
      throw new Error(
        `Invalid HPX centre for ` +
          `order=${this.order}, NPIX=${this.tileno}: ` +
          `x=${xCenter}, y=${yCenter}`,
      );
    }

    /*
     * FITS uses one-based pixel coordinates.
     *
     * For a 512x512 image the geometric centre is
     * therefore:
     *
     *   (256.5, 256.5)
     */
    const p = (this.tileWidth + 1) / 2;

    /*
     * Pixel -> HPX intermediate-plane transform:
     *
     *   x =
     *     -scale * (p1 - CRPIX1)
     *     -scale * (p2 - CRPIX2)
     *
     *   y =
     *      scale * (p1 - CRPIX1)
     *     -scale * (p2 - CRPIX2)
     *
     * At the geometric tile centre p1=p2=p:
     *
     *   CRPIX1 + CRPIX2 =
     *     2*p + xCenter/scale
     *
     *   CRPIX2 - CRPIX1 =
     *     yCenter/scale
     */
    const crpixSum = 2 * p + xCenter / scale;

    const crpixDifference = yCenter / scale;

    const crpix1 = 0.5 * (crpixSum - crpixDifference);

    const crpix2 = 0.5 * (crpixSum + crpixDifference);

    this.header.insert(
      new FITSHeaderItem(FITSHeaderManager.CTYPE1, HiPSFITS.CTYPE1, ""),
    );

    this.header.insert(
      new FITSHeaderItem(FITSHeaderManager.CTYPE2, HiPSFITS.CTYPE2, ""),
    );

    /*
     * Standard HPX celestial reference.
     */
    this.header.insert(new FITSHeaderItem(FITSHeaderManager.CRVAL1, 0, ""));

    this.header.insert(new FITSHeaderItem(FITSHeaderManager.CRVAL2, 0, ""));

    /*
     * HiPS tile orientation in the global HPX plane.
     */
    this.header.insert(new FITSHeaderItem("CD1_1", -scale, ""));

    this.header.insert(new FITSHeaderItem("CD1_2", -scale, ""));

    this.header.insert(new FITSHeaderItem("CD2_1", scale, ""));

    this.header.insert(new FITSHeaderItem("CD2_2", -scale, ""));

    this.header.insert(
      new FITSHeaderItem(FITSHeaderManager.CRPIX1, crpix1, ""),
    );

    this.header.insert(
      new FITSHeaderItem(FITSHeaderManager.CRPIX2, crpix2, ""),
    );

    /*
     * HEALPix HPX projection parameters.
     *
     * H = 4
     * K = 3
     */
    this.header.insert(new FITSHeaderItem("PV2_1", HiPSIntermediateProj.H, ""));

    this.header.insert(new FITSHeaderItem("PV2_2", HiPSIntermediateProj.K, ""));
  }
}
