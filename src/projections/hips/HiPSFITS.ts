import {
  FITSHeaderItem,
  FITSHeaderManager,
  FITSParser,
  ParsePayload,
  PrimaryHDU,
} from "jsfitsio";
import { HiPSIntermediateProj } from "./HiPSIntermediateProj.js";
import { Healpix, Pointing } from "astrospatial-core/healpix";
import { HEALPixXYSpace } from "../../model/HEALPixXYSpace.js";
import { fillAstro, radToDeg } from "../../model/Utils.js";
import { NumberType } from "../../model/NumberType.js";
import { HiPSHelper } from "../HiPSHelper.js";
import { HiPSProperties } from "./HiPSProperties.js";
import { ImagePixel } from "./ImagePixel.js";

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
  private static NPIX: string = "NPIX";

  constructor(
    fits: PrimaryHDU | null,
    tileno: number | null,
    hipsProp: HiPSProperties | null,
  ) {
    if (fits) {
      this.initFromPrimaryHDU(fits);
    } else if (!tileno || !hipsProp) {
      console.error("tileno or hipsProp are not defined");
      throw new Error("tileno or hipsProp are not defined");
    } else {
      this.order = hipsProp.getItem(HiPSProperties.ORDER);

      const naxis1 = hipsProp.getItem(HiPSProperties.TILE_WIDTH);
      const naxis2 = hipsProp.getItem(HiPSProperties.TILE_WIDTH);

      this.tileno = tileno;

      if (naxis1 !== naxis2) {
        console.error("NAXIS1 and NAXIS2 do not match.");
        throw new Error("NAXIS1 and NAXIS2 do not match.");
      }

      this.tileWidth = naxis1;
      this.healpix = HiPSHelper.getHelpixByOrder(this.order);
      this.intermediateXYGrid = HiPSIntermediateProj.setupByTile(
        this.tileno,
        this.healpix,
      );
    }
  }

  initFromUint8Array(
    imagePixelList: ImagePixel[],
    fitsHeaderParams: FITSHeaderManager,
    tileWidth: number,
  ) {
    this.setPayload(imagePixelList, fitsHeaderParams, tileWidth);
    this.setHeader(fitsHeaderParams);
  }
  // initFromUint8Array(raDecList: [number, number][], originalValues: Uint8Array, fitsHeaderParams: FITSHeaderManager) {
  //     this.setPayload(raDecList, originalValues, fitsHeaderParams)
  //     this.setHeader(fitsHeaderParams)
  // }

  //   getHeader() {
  //     return this.header;
  //   }

  getPayload() {
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

  initFromPrimaryHDU(fits: PrimaryHDU) {
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
      Number.isNaN(this.order) ||
      !Number.isFinite(naxis1) ||
      !Number.isFinite(naxis2) ||
      Number.isNaN(this.tileno)
    ) {
      throw new Error("ORDER, NAXIS1, NAXIS2 or NPIX not defined");
    }

    if (naxis1 !== naxis2) {
      throw new Error("NAXIS1 and NAXIS2 do not match.");
    }

    this.tileWidth = naxis1;
    this.computeMinMax(fits);
    this.setHeader(fits.header);
  }

  getTileno() {
    return this.tileno;
  }

  private computeMinMax(fits: PrimaryHDU) {
    if (fits.rawData === null) {
      return;
    }

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
  ) {
    const bitpix = Number(
      fitsHeaderParams.findById(FITSHeaderManager.BITPIX)?.value,
    );
    const bzero = Number(
      fitsHeaderParams.findById(FITSHeaderManager.BZERO)?.value,
    );
    const bscale = Number(
      fitsHeaderParams.findById(FITSHeaderManager.BSCALE)?.value,
    );

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
      const [col, row] = HiPSIntermediateProj.intermediate2pix(
        xy[0],
        xy[1],
        this.intermediateXYGrid,
        tileWidth,
      );

      if (row < 0 || row >= tileWidth || col < 0 || col >= tileWidth) return;

      const valueBytes = imgpx.getUint8Value();
      if (!valueBytes) return; // or continue, depending on context

      for (let b = 0; b < bytesXelem; b++) {
        this.payload[row][col * bytesXelem + b] = valueBytes[b];
      }

      const valpixb = ParsePayload.extractPixelValue(valueBytes, 0, bitpix);
      if (valpixb == null) return;

      const valphysical = bzero + bscale * valpixb;
      if (isNaN(this.min) || valphysical < this.min) this.min = valphysical;
      if (isNaN(this.max) || valphysical > this.max) this.max = valphysical;
    });
  }

  private addMandatoryItemToHeader(
    key: string,
    fitsHeaderParams: FITSHeaderManager,
  ) {
    const value = fitsHeaderParams.findById(key)?.value;
    if (value === undefined || value == null) {
      console.error(`${key} not defined`);
      throw new Error(key + " is not defined");
    }
    const item = new FITSHeaderItem(key, value, "");
    this.header.insert(item);
  }

  private addItemToHeader(key: string, fitsHeaderParams: FITSHeaderManager) {
    const value = fitsHeaderParams.findById(key)?.value;
    if (value !== undefined || value != null) {
      const item = new FITSHeaderItem(key, value, "");
      this.header.insert(item);
    }
  }

  private setHeader(fitsHeaderParams: FITSHeaderManager) {
    this.header = new FITSHeaderManager();

    this.addMandatoryItemToHeader(FITSHeaderManager.SIMPLE, fitsHeaderParams);
    this.addMandatoryItemToHeader(FITSHeaderManager.BITPIX, fitsHeaderParams);

    this.addItemToHeader(FITSHeaderManager.BLANK, fitsHeaderParams);
    this.addItemToHeader(FITSHeaderManager.BSCALE, fitsHeaderParams);
    this.addItemToHeader(FITSHeaderManager.BZERO, fitsHeaderParams);

    this.header.insert(
      new FITSHeaderItem(FITSHeaderManager.NAXIS, Number(2), ""),
    );

    this.header.insert(
      new FITSHeaderItem(FITSHeaderManager.NAXIS1, Number(this.tileWidth), ""),
    );

    this.header.insert(
      new FITSHeaderItem(FITSHeaderManager.NAXIS2, Number(this.tileWidth), ""),
    );

    this.header.insert(
      new FITSHeaderItem(FITSHeaderManager.CTYPE1, HiPSFITS.CTYPE1, ""),
    );

    this.header.insert(
      new FITSHeaderItem(FITSHeaderManager.CTYPE2, HiPSFITS.CTYPE2, ""),
    );

    this.header.insert(
      new FITSHeaderItem(FITSHeaderManager.DATAMIN, this.min, ""),
    );

    this.header.insert(
      new FITSHeaderItem(FITSHeaderManager.DATAMAX, this.max, ""),
    );

    this.header.insert(
      new FITSHeaderItem(HiPSProperties.ORDER, Number(this.order), ""),
    );

    this.header.insert(
      new FITSHeaderItem(HiPSFITS.NPIX, Number(this.tileno), ""),
    );

    const crpix = this.tileno / 2;
    this.header.insert(new FITSHeaderItem(FITSHeaderManager.CRPIX1, crpix, ""));

    this.header.insert(new FITSHeaderItem(FITSHeaderManager.CRPIX2, crpix, ""));

    this.header.insert(
      new FITSHeaderItem(FITSHeaderManager.ORIGIN, "WCSLight v.0.x", ""),
    );

    this.header.insert(
      new FITSHeaderItem(
        FITSHeaderManager.COMMENT,
        "",
        "WCSLight v0.x developed by F.Giordano and Y.Ascasibar",
      ),
    );

    let vec3 = this.healpix.pix2vec(this.tileno);
    let ptg = new Pointing(vec3);
    let crval1 = radToDeg(ptg.phi);
    let crval2 = 90 - radToDeg(ptg.theta);

    this.header.insert(
      new FITSHeaderItem(FITSHeaderManager.CRVAL1, crval1, ""),
    );
    this.header.insert(
      new FITSHeaderItem(FITSHeaderManager.CRVAL2, crval2, ""),
    );

    this.header.insert(new FITSHeaderItem("END", "", ""));
  }
}
