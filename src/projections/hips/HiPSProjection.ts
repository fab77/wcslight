import { FITSList } from "./FITSList.js";
import { HiPSProperties } from "./HiPSProperties.js";
import { HiPSPropManager } from "./HiPSPropManager.js";
import { Point } from "../../model/Point.js";
import { Healpix, Pointing, RangeSet } from "astrospatial-core/healpix";
import { degToRad } from "../../model/Utils.js";
import { HiPSIntermediateProj } from "./HiPSIntermediateProj.js";
import { FITSHeaderManager, FITSParser } from "jsfitsio";
import { HiPSFITS } from "./HiPSFITS.js";
import { ImagePixel } from "./ImagePixel.js";
import { HiPSHelper } from "../HiPSHelper.js";
import { CoordsType } from "../../model/CoordsType.js";
import { NumberType } from "../../model/NumberType.js";
import { HEALPixXYSpace } from "../../model/HEALPixXYSpace.js";
import { TilesRaDecList2 } from "./TilesRaDecList2.js";
import { FITSUtils } from "../../utils/FITSUtils.js";

export class HiPSProjection {
  private baseURL: string;
  private healpix: Healpix | null = null;
  private hipsProp: HiPSProperties | null = null;

  constructor(baseHiPSPath: string) {
    this.baseURL = baseHiPSPath;
    this.init();
    if (this.healpix == null) {
      console.warn("healpix is null");
      throw new Error("healpix is null");
    }
    if (this.hipsProp == null) {
      console.warn("HiPSProp is null");
      throw new Error("HiPSProp is null");
    }
  }

  async init() {
    const hipsProp = await this.parsePropertyFile();
    const order = hipsProp.getItem(HiPSProperties.ORDER);
    this.healpix = HiPSHelper.getHelpixByOrder(order);
  }

  private async parsePropertyFile() {
    const hipsProp = HiPSPropManager.parsePropertyFile(this.baseURL);
    return hipsProp;
  }

  static getImageRADecList(
    center: Point,
    radiusDeg: number,
    pixelAngSize: number,
    TILE_WIDTH: number,
  ): TilesRaDecList2 | null {
    const healpix = HiPSHelper.getHelpixBypxAngSize(pixelAngSize, TILE_WIDTH);

    // let tilesRaDecList2 = new TilesRaDecList2(healpix.order)
    let tilesRaDecList2 = new TilesRaDecList2();

    const ptg = new Pointing(
      null,
      false,
      center.getSpherical().thetaRad,
      center.getSpherical().phiRad,
    );
    const radius_rad = degToRad(radiusDeg);

    // ??? with fact 8 the original Java code starts returning the the ptg pixel. with my JS porting only from fact 16
    const rangeset: RangeSet = healpix.queryDiscInclusive(ptg, radius_rad, 4); // <= check it

    // TODO try to replace tileslist with FITSList!!!
    // const tileslist: Array<number> = [];
    for (let p = 0; p < rangeset.r.length; p++) {
      // if (!tileslist.includes(rangeset.r[p]) && rangeset.r[p] != 0) {
      //     tileslist.push(rangeset.r[p]);
      // }
      if (
        !tilesRaDecList2.getTilesList().includes(rangeset.r[p]) &&
        rangeset.r[p] != 0
      ) {
        tilesRaDecList2.addTileNumber(rangeset.r[p]);
        // tileslist.push(rangeset.r[p]);
      }
    }

    const cpix = healpix.ang2pix(ptg);
    // if (!tileslist.includes(cpix)) {
    //     tileslist.push(cpix);
    // }
    if (!tilesRaDecList2.getTilesList().includes(cpix)) {
      tilesRaDecList2.getTilesList().push(cpix);
    }

    // let raDecList: Array<[number, number]> = []
    let minra = center.getAstro().raDeg - radiusDeg;
    let maxra = center.getAstro().raDeg + radiusDeg;
    let mindec = center.getAstro().decDeg - radiusDeg;
    let maxdec = center.getAstro().decDeg + radiusDeg;

    tilesRaDecList2.getTilesList().forEach((tileno: number) => {
      // tileslist.forEach((tileno: number) => {

      for (let j = 0; j < TILE_WIDTH; j++) {
        for (let i = 0; i < TILE_WIDTH; i++) {
          const point: Point | null = HiPSProjection.pix2world(
            i,
            j,
            tileno,
            healpix,
            TILE_WIDTH,
          );

          if (point == null) continue;
          if (
            point.getAstro().raDeg < minra ||
            point.getAstro().raDeg > maxra ||
            point.getAstro().decDeg < mindec ||
            point.getAstro().decDeg > maxdec
          ) {
            continue;
          }
          tilesRaDecList2.addImagePixel(
            new ImagePixel(
              point.getAstro().raDeg,
              point.getAstro().decDeg,
              tileno,
            ),
          );
          // raDecList.push([point.getAstro().raDeg, point.getAstro().decDeg]);
        }
      }
    });

    // const tilesRaDecList = new TilesRaDecList(raDecList, tileslist)
    // return tilesRaDecList
    return tilesRaDecList2;
  }

  private static _xyGridCache: Map<string, HEALPixXYSpace> = new Map();

  static pix2world(
    i: number,
    j: number,
    tileno: number,
    healpix: Healpix,
    TILE_WIDTH: number,
  ): Point | null {
    const order = (healpix as any).order ?? Math.log2((healpix as any).nside); // keep compatibility with Healpix implementations exposing order or nside
    const cacheKey = `${order}:${tileno}`;

    let xyGridProj = HiPSProjection._xyGridCache.get(cacheKey);
    if (!xyGridProj) {
      xyGridProj = HiPSIntermediateProj.setupByTile(tileno, healpix);
      const Dx = xyGridProj.max_x - xyGridProj.min_x;
      const Dy = xyGridProj.max_y - xyGridProj.min_y;
      console.log(
        `deltaX: ${Dx}, deltaY ${Dy} order ${order} tileno ${tileno}`,
      );
      HiPSProjection._xyGridCache.set(cacheKey, xyGridProj);
    }

    if (!healpix) return null;
    // const xyGridProj = HiPSIntermediateProj.setupByTile(tileno, healpix);
    const [x, y] = HiPSIntermediateProj.pix2intermediate(
      i,
      j,
      xyGridProj,
      TILE_WIDTH,
      TILE_WIDTH,
    );
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    const p = HiPSIntermediateProj.intermediate2world(x, y);
    const ra = p.getAstro().raDeg;
    const dec = p.getAstro().decDeg;

    if (!Number.isFinite(ra) || !Number.isFinite(dec)) return null;
    return p;
  }

  // static getFITSFiles(inputValues: Uint8Array, tilesRaDecList: TilesRaDecList, fitsHeaderParams: FITSHeaderManager, pixelAngSize: number, TILE_WIDTH?: number): FITSList {
  static getFITSFiles(
    tilesRaDecList: TilesRaDecList2,
    fitsHeaderParams: FITSHeaderManager,
    pixelAngSize: number,
    TILE_WIDTH: number,
  ): FITSList {
    const healpix = HiPSHelper.getHelpixBypxAngSize(pixelAngSize, TILE_WIDTH);

    let fitsList = new FITSList();

    tilesRaDecList.getTilesList().forEach((tileno: number) => {
      let hipsProp = new HiPSProperties();
      hipsProp.addItem(HiPSProperties.ORDER, healpix.order);
      hipsProp.addItem(HiPSProperties.TILE_WIDTH, TILE_WIDTH);
      const hipsFits = new HiPSFITS(null, tileno, hipsProp);

      const imagePixelsByTilesNo = tilesRaDecList.getImagePixelsByTile(tileno);

      hipsFits.initFromUint8Array(
        imagePixelsByTilesNo,
        fitsHeaderParams,
        TILE_WIDTH,
      );
      fitsList.addFITS(hipsFits);
    });
    return fitsList;
  }

  static async world2pix(
    radeclist: TilesRaDecList2,
    hipsOrder: number,
    isGalactic: boolean,
    TILE_WIDTH: number,
    baseHiPSURL: string,
  ): Promise<TilesRaDecList2 | null> {
    const healpix = HiPSHelper.getHelpixByOrder(hipsOrder);

    let tileno: number;
    let prevTileno: number | null = null;
    /* if HiPS in galactic => convert the full list of (RA, Dec) to Galactic  (l, b) */
    if (isGalactic) {
      HiPSProjection.convertToGalactic(radeclist);
    }
    let xyGridProj: HEALPixXYSpace | null = null;

    radeclist.getImagePixelList().forEach((imgpx) => {
      const ra = imgpx.getRADeg();
      const dec = imgpx.getDecDeg();

      const p = new Point(CoordsType.ASTRO, NumberType.DEGREES, ra, dec);
      const ptg = new Pointing(
        null,
        false,
        p.getSpherical().thetaRad,
        p.getSpherical().phiRad,
      );

      tileno = healpix.ang2pix(ptg);

      if (prevTileno !== tileno || prevTileno == null) {
        xyGridProj = HiPSIntermediateProj.setupByTile(tileno, healpix);
        prevTileno = tileno;
      }
      if (xyGridProj) {
        const xy = HiPSIntermediateProj.world2intermediate(p.getAstro());
        const ij = HiPSIntermediateProj.intermediate2pix(
          xy[0],
          xy[1],
          xyGridProj,
          TILE_WIDTH,
        );
        imgpx.setij(ij[0], ij[1]);
        imgpx.setTileNumber(tileno);
      }
      radeclist.addTileNumber(tileno);
    });
    let result = await HiPSProjection.getPixelValues(
      radeclist,
      baseHiPSURL,
      hipsOrder,
    );
    return result;
  }

  // TODO move this to Utils.js
  static convertToGalactic(radeclist: TilesRaDecList2) {
    // let finalradeclist: number[][] = [];
    const deg2rad = Math.PI / 180;
    const rad2deg = 180 / Math.PI;
    const l_NCP = deg2rad * 122.93;
    const d_NGP = deg2rad * 27.1284;
    const a_NGP = deg2rad * 192.8595;
    radeclist.getImagePixelList().forEach((imgpx) => {
      const ra = imgpx.getRADeg();
      const dec = imgpx.getDecDeg();
      const ra_rad = deg2rad * ra;
      const dec_rad = deg2rad * dec;
      // sin(b)
      const sin_b =
        Math.sin(d_NGP) * Math.sin(dec_rad) +
        Math.cos(d_NGP) * Math.cos(dec_rad) * Math.cos(ra_rad - a_NGP);
      const b = Math.asin(sin_b);
      const b_deg = b * rad2deg;

      // l_NCP - l
      const lNCP_minus_l = Math.atan(
        (Math.cos(dec_rad) * Math.sin(ra_rad - a_NGP)) /
          (Math.sin(dec_rad) * Math.cos(d_NGP) -
            Math.cos(dec_rad) * Math.sin(d_NGP) * Math.cos(ra_rad - a_NGP)),
      );
      const l = l_NCP - lNCP_minus_l;
      const l_deg = l * rad2deg;
      imgpx.setRADecDeg(l_deg, b_deg);
      // finalradeclist.push([l_deg, b_deg])
    });
    // return finalradeclist;
  }

  static async getPixelValues(
    raDecList: TilesRaDecList2,
    baseHiPSURL: string,
    hipsOrder: number,
  ): Promise<TilesRaDecList2 | null> {
    const tilesset = raDecList.getTilesList();

    let resolvedBitpix: number | null = null;

    for (const hipstileno of tilesset) {
      const dir = Math.floor(hipstileno / 10000) * 10000;

      const fitsurl =
        baseHiPSURL +
        "/Norder" +
        hipsOrder +
        "/Dir" +
        dir +
        "/Npix" +
        hipstileno +
        ".fits";

      console.log(`Identified source file ${fitsurl}`);

      const fitsFile = await FITSParser.loadFITSFile(fitsurl);

      const image = fitsFile?.primaryHDU;

      if (!image) {
        continue;
      }

      if (image.naxis !== 2) {
        console.warn(
          `Expected a 2D HiPS FITS tile, got NAXIS=${image.naxis} for ${fitsurl}`,
        );

        continue;
      }

      if (image.rawData === null) {
        console.warn(`FITS tile ${fitsurl} does not contain image data`);

        continue;
      }

      const bitpix = image.bitpix;

      const naxis1 = image.shape[0] ?? 0;

      const naxis2 = image.shape[1] ?? 0;

      if (!Number.isFinite(bitpix) || naxis1 <= 0 || naxis2 <= 0) {
        console.error(
          `bitpix: ${bitpix}, naxis1: ${naxis1}, naxis2: ${naxis2} for fits file ${fitsurl}`,
        );

        continue;
      }

      if (resolvedBitpix === null) {
        resolvedBitpix = bitpix;
      }

      /*
       * Read FITS scaling information once.
       */

      if (raDecList.getBLANK() === null) {
        const blankValue = image.header.findById("BLANK")?.value;

        if (blankValue !== undefined && blankValue !== null) {
          const blank = Number(blankValue);

          if (!Number.isNaN(blank)) {
            raDecList.setBLANK(blank);
          }
        }
      }

      if (raDecList.getBSCALE() === null) {
        const bscaleValue = image.header.findById("BSCALE")?.value;

        if (bscaleValue !== undefined && bscaleValue !== null) {
          const bscale = Number(bscaleValue);

          if (!Number.isNaN(bscale)) {
            raDecList.setBSCALE(bscale);
          }
        }
      }

      if (raDecList.getBZERO() === null) {
        const bzeroValue = image.header.findById("BZERO")?.value;

        if (bzeroValue !== undefined && bzeroValue !== null) {
          const bzero = Number(bzeroValue);

          if (!Number.isNaN(bzero)) {
            raDecList.setBZERO(bzero);
          }
        }
      }

      const bytesPerElement = Math.abs(bitpix) / 8;

      const tilePixels = raDecList.getImagePixelsByTile(hipstileno);

      for (const imgpx of tilePixels) {
        const row = imgpx.getj();

        const column = imgpx.geti();

        if (row < 0 || row >= naxis2) {
          console.warn(
            `j index ${row} is outside the image range 0-${naxis2 - 1} for fits file ${fitsurl}`,
          );

          continue;
        }

        if (column < 0 || column >= naxis1) {
          console.warn(
            `i index ${column} is outside the image range 0-${naxis1 - 1} for fits file ${fitsurl}`,
          );

          continue;
        }

        /*
         * FITS image data is stored linearly.
         *
         * NAXIS1 is the fastest-changing axis.
         */
        const elementIndex = row * naxis1 + column;

        const byteOffset = elementIndex * bytesPerElement;

        const valueBytes = image.rawData.slice(
          byteOffset,
          byteOffset + bytesPerElement,
        );

        imgpx.setValue(valueBytes, bitpix);

        raDecList.setMinMaxValue(imgpx.getValue());
      }
    }

    /*
     * FITS defaults.
     */
    if (raDecList.getBSCALE() === null) {
      raDecList.setBSCALE(1);
    }

    if (raDecList.getBZERO() === null) {
      raDecList.setBZERO(0);
    }

    if (raDecList.getBLANK() === null) {
      raDecList.setBLANK(0);
    }

    /*
     * Fill pixels that were not resolved
     * from any HiPS tile with BLANK.
     */
    if (resolvedBitpix !== null) {
      const bytesPerElement = Math.abs(resolvedBitpix) / 8;

      const blankValue = raDecList.getBLANK() ?? 0;

      const blankBytes = FITSUtils.convertBlankToBytes(
        blankValue,
        bytesPerElement,
      );

      for (const imgpx of raDecList.getImagePixelList()) {
        if (imgpx.getUint8Value() === null) {
          imgpx.setValue(blankBytes.slice(), resolvedBitpix);
        }
      }
    }

    return raDecList;
  }
}
