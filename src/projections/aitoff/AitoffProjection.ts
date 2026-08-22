/**
 * Aitoff (Hammer–Aitoff) projection for FITS WCS ('AIT')
 * CTYPE1='RA---AIT', CTYPE2='DEC--AIT'
 *
 * The pixel plane is in "projected degrees": we convert between
 * (RA,Dec) <-> (x_deg,y_deg) where x_deg,y_deg are the Hammer–Aitoff
 * projected coordinates scaled to degrees so that CDELT remains deg/pixel.
 */

import {
  FITSParser,
  FITSHeaderManager,
  FITSHeaderItem,
  PrimaryHDU,
} from "jsfitsio";
import { AbstractProjection } from "../AbstractProjection.js";
import { Point } from "../../model/Point.js";
import { CoordsType } from "../../model/CoordsType.js";
import { NumberType } from "../../model/NumberType.js";
import { TilesRaDecList2 } from "../hips/TilesRaDecList2.js";
import { ImagePixel } from "../hips/ImagePixel.js";
import { FITS } from "../../model/FITS.js";
import { APP_VERSION } from "../../Version.js";
import { FITSUtils } from "../../utils/FITSUtils.js";

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

// ───────────────────────────────────────────────────────────────────────────────
// Spherical helpers (all angles in *radians* here)
// Center-relative long/lat (λ', φ') from absolute (α, δ) and center (α0, δ0)
function toCenteredLonLat(
  ra: number,
  dec: number,
  ra0: number,
  dec0: number,
): { lam: number; phi: number } {
  const cosDec = Math.cos(dec);

  const x = cosDec * Math.cos(ra);
  const y = cosDec * Math.sin(ra);
  const z = Math.sin(dec);

  /*
   * Local orthonormal basis at (ra0, dec0):
   *
   * center = local +X
   * east   = local +Y
   * north  = local +Z
   */
  const cx = Math.cos(dec0) * Math.cos(ra0);
  const cy = Math.cos(dec0) * Math.sin(ra0);
  const cz = Math.sin(dec0);

  const ex = -Math.sin(ra0);
  const ey = Math.cos(ra0);
  const ez = 0;

  const nx = -Math.sin(dec0) * Math.cos(ra0);
  const ny = -Math.sin(dec0) * Math.sin(ra0);
  const nz = Math.cos(dec0);

  const localX = x * cx + y * cy + z * cz;

  const localY = x * ex + y * ey + z * ez;

  const localZ = x * nx + y * ny + z * nz;

  const lam = Math.atan2(localY, localX);

  const phi = Math.asin(clamp(localZ, -1, 1));

  return {
    lam,
    phi,
  };
}

function fromCenteredLonLat(
  lam: number,
  phi: number,
  ra0: number,
  dec0: number,
): { ra: number; dec: number } {
  const cosPhi = Math.cos(phi);

  const localX = cosPhi * Math.cos(lam);

  const localY = cosPhi * Math.sin(lam);

  const localZ = Math.sin(phi);

  const cx = Math.cos(dec0) * Math.cos(ra0);
  const cy = Math.cos(dec0) * Math.sin(ra0);
  const cz = Math.sin(dec0);

  const ex = -Math.sin(ra0);
  const ey = Math.cos(ra0);
  const ez = 0;

  const nx = -Math.sin(dec0) * Math.cos(ra0);
  const ny = -Math.sin(dec0) * Math.sin(ra0);
  const nz = Math.cos(dec0);

  const x = localX * cx + localY * ex + localZ * nx;

  const y = localX * cy + localY * ey + localZ * ny;

  const z = localX * cz + localY * ez + localZ * nz;

  const ra = normalize2pi(Math.atan2(y, x));

  const dec = Math.asin(clamp(z, -1, 1));

  return {
    ra,
    dec,
  };
}

function clamp(x: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, x));
}
function normalize2pi(a: number): number {
  a %= 2 * Math.PI;
  return a < 0 ? a + 2 * Math.PI : a;
}
function normalizePi(a: number): number {
  a = (a + Math.PI) % (2 * Math.PI);
  return a < 0 ? a + 2 * Math.PI - Math.PI : a - Math.PI;
}

// ───────────────────────────────────────────────────────────────────────────────
// Hammer–Aitoff forward/inverse (λ', φ') <-> (x, y)
// Uses the canonical √2 scaling. x,y returned in *radians-of-radius*.
function aitForward(lam: number, phi: number): { x: number; y: number } {
  // D = sqrt(1 + cosφ cos(λ/2))
  const cφ = Math.cos(phi),
    sφ = Math.sin(phi);
  const half = lam / 2;
  const D = Math.sqrt(1 + cφ * Math.cos(half));
  if (D === 0) return { x: 0, y: 0 };
  const x = (2 * Math.SQRT2 * cφ * Math.sin(half)) / D;
  const y = (Math.SQRT2 * sφ) / D;
  return { x, y };
}

function aitInverse(x: number, y: number): { lam: number; phi: number } | null {
  /*
   * FITS WCS Hammer-Aitoff inverse.
   *
   * x and y are the projected plane coordinates
   * expressed in radians.
   */
  const zSquared = 1 - (x * x) / 16 - (y * y) / 4;

  /*
   * Outside the Hammer-Aitoff ellipse.
   */
  if (zSquared < -1e-14) {
    return null;
  }

  const z = Math.sqrt(Math.max(0, zSquared));

  const lam = 2 * Math.atan2((z * x) / 2, 2 * z * z - 1);

  const phi = Math.asin(clamp(y * z, -1, 1));

  if (!Number.isFinite(lam) || !Number.isFinite(phi)) {
    return null;
  }

  return {
    lam,
    phi,
  };
}

// Convert AIT plane (x_deg,y_deg) <-> radians for the math above
function planeDegToRad(xdeg: number, ydeg: number): { xr: number; yr: number } {
  return { xr: xdeg * DEG2RAD, yr: ydeg * DEG2RAD };
}
function planeRadToDeg(xr: number, yr: number): { xd: number; yd: number } {
  return { xd: xr * RAD2DEG, yd: yr * RAD2DEG };
}

// ───────────────────────────────────────────────────────────────────────────────

export class AitoffProjection extends AbstractProjection {
  // Note: minra/mindec store minXdeg/minYdeg of the projected plane
  minra!: number;
  mindec!: number;
  naxis1!: number;
  naxis2!: number;
  bitpix!: number;

  fitsheader: FITSHeaderManager;
  pxvalues: Array<Uint8Array>;

  CTYPE1 = "'RA---AIT'";
  CTYPE2 = "'DEC--AIT'";
  craDeg!: number; // CRVAL1 center RA (deg)
  cdecDeg!: number; // CRVAL2 center Dec (deg)
  pxsize!: number; // CDELT (deg/pixel)
  _wcsname: string;

  constructor() {
    super();
    this._wcsname = "AIT";
    this.pxvalues = [];
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
        `AitoffProjection requires a 2D FITS image, got NAXIS=${fits.naxis}`,
      );
    }

    this.pxvalues = this.createRawRows(fits);
    this.fitsheader = fits.header;
    this.naxis1 = fits.shape[0] ?? 0;
    this.naxis2 = fits.shape[1] ?? 0;
    this.bitpix = fits.bitpix;
    this.craDeg = Number(fits.header.findById("CRVAL1")?.value);
    this.cdecDeg = Number(fits.header.findById("CRVAL2")?.value);

    const pxsize1 = Number(fits.header.findById("CDELT1")?.value);
    const pxsize2 = Number(fits.header.findById("CDELT2")?.value);

    if (pxsize1 !== pxsize2 || Number.isNaN(pxsize1) || Number.isNaN(pxsize2)) {
      throw new Error("Invalid or inconsistent CDELT1/CDELT2");
    }
    this.pxsize = pxsize1;

    /*
     * In AIT the projection center maps to
     * plane coordinates (0, 0).
     *
     * Therefore the minimum projected plane
     * coordinates are half the image extent
     * around the center.
     */
    this.minra = -(this.pxsize * this.naxis1) / 2;

    this.mindec = -(this.pxsize * this.naxis2) / 2;
    return fits;
  }

  getBytePerValue(): number {
    return Math.abs(this.bitpix / 8);
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

  // ── AbstractProjection: WCS header accessors ───────────────────────────────
  getFITSHeader(): FITSHeaderManager {
    return this.fitsheader;
  }

  getCommonFitsHeaderParams(): FITSHeaderManager {
    const header = new FITSHeaderManager();
    for (const item of this.fitsheader.getItems()) {
      const key = item.key;
      if (
        ["SIMPLE", "BITPIX", "BSCALE", "BZERO", "BLANK", "ORDER"].includes(key)
      ) {
        header.insert(new FITSHeaderItem(key, item.value, ""));
      }
    }
    return header;
  }

  // ── AbstractProjection: grid builder ───────────────────────────────────────
  getImageRADecList(
    center: Point,
    radius: number,
    pxsize: number,
    naxisWidth: number,
  ): TilesRaDecList2 {
    const naxis1 = naxisWidth;
    const naxis2 = naxisWidth;

    const ra0 = center.getAstro().raDeg * DEG2RAD;
    const dec0 = center.getAstro().decDeg * DEG2RAD;

    const minXdeg = -radius;
    const minYdeg = -radius;

    const list = new TilesRaDecList2();

    for (let j = 0; j < naxis2; j++) {
      const yDeg = minYdeg + j * pxsize;
      const { yr } = planeDegToRad(0, yDeg);
      for (let i = 0; i < naxis1; i++) {
        const xDeg = minXdeg + i * pxsize;
        const { xr } = planeDegToRad(xDeg, 0);

        const inv = aitInverse(xr, yr);
        if (!inv) {
          // Outside valid ellipse; set BLANK later during sampling
          list.addImagePixel(new ImagePixel(Number.NaN, Number.NaN, undefined));
          continue;
        }
        const { lam, phi } = inv; // centered lon/lat
        const { ra, dec } = fromCenteredLonLat(lam, phi, ra0, dec0);
        const raDeg = ra * RAD2DEG;
        const decDeg = dec * RAD2DEG;
        list.addImagePixel(new ImagePixel(raDeg, decDeg, undefined));
      }
    }
    return list;
  }

  computeNaxisWidth(radius: number, pxsize: number): number {
    return Math.ceil((2 * radius) / pxsize);
  }

  // ── AbstractProjection: pixel<->world ──────────────────────────────────────
  pix2world(
    i: number,
    j: number,
    pxsize: number,
    minPlaneXdeg: number,
    minPlaneYdeg: number,
  ): Point {
    // plane coords (degrees) relative to the projection center
    const xDeg = i * pxsize + minPlaneXdeg;
    const yDeg = j * pxsize + minPlaneYdeg;

    const { xr, yr } = planeDegToRad(xDeg, yDeg);
    const inv = aitInverse(xr, yr);
    // Use the class center (CRVAL1/2)
    const ra0 = this.craDeg * DEG2RAD;
    const dec0 = this.cdecDeg * DEG2RAD;

    if (!inv) {
      return new Point(
        CoordsType.ASTRO,
        NumberType.DEGREES,
        Number.NaN,
        Number.NaN,
      );
    }
    const { lam, phi } = inv;
    const { ra, dec } = fromCenteredLonLat(lam, phi, ra0, dec0);
    return new Point(
      CoordsType.ASTRO,
      NumberType.DEGREES,
      ra * RAD2DEG,
      dec * RAD2DEG,
    );
  }

  world2pix(raDecList: TilesRaDecList2): TilesRaDecList2 {
    const bytesXvalue = this.getBytePerValue();
    const blank = Number(this.fitsheader.findById("BLANK")?.value);
    const blankBytes = FITSUtils.convertBlankToBytes(blank, bytesXvalue);

    const ra0 = this.craDeg * DEG2RAD;
    const dec0 = this.cdecDeg * DEG2RAD;

    for (const px of raDecList.getImagePixelList()) {
      const raDeg = px.getRADeg();
      const decDeg = px.getDecDeg();
      if (!Number.isFinite(raDeg) || !Number.isFinite(decDeg)) {
        px.setij(-1, -1);
        px.setValue(blankBytes, this.bitpix);
        continue;
      }

      // Center-relative spherical coords
      const { lam, phi } = toCenteredLonLat(
        raDeg * DEG2RAD,
        decDeg * DEG2RAD,
        ra0,
        dec0,
      );
      const { x, y } = aitForward(lam, phi);

      // plane x/y in degrees
      const { xd, yd } = planeRadToDeg(x, y);
      const i = Math.floor((xd - this.minra) / this.pxsize);
      const j = Math.floor((yd - this.mindec) / this.pxsize);
      px.setij(i, j);

      if (j < 0 || j >= this.naxis2 || i < 0 || i >= this.naxis1) {
        px.setValue(blankBytes, this.bitpix);
      } else {
        const row = this.pxvalues[j];
        const slice = row.slice(i * bytesXvalue, (i + 1) * bytesXvalue);
        px.setValue(slice, this.bitpix);
      }
      raDecList.setMinMaxValue(px.getValue());
    }
    return raDecList;
  }

  // ── FITS write path ────────────────────────────────────────────────────────
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
    const header = this.prepareHeader(
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
    return this.setPixelValues(raDecWithValues, header);
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
    const h = new FITSHeaderManager();
    h.insert(new FITSHeaderItem("SIMPLE", "T", ""));
    h.insert(new FITSHeaderItem("NAXIS", 2, ""));
    h.insert(new FITSHeaderItem("NAXIS1", TILE_WIDTH, ""));
    h.insert(new FITSHeaderItem("NAXIS2", TILE_WIDTH, ""));
    h.insert(new FITSHeaderItem("BITPIX", BITPIX, ""));
    h.insert(new FITSHeaderItem("BLANK", BLANK, ""));
    h.insert(new FITSHeaderItem("BSCALE", BSCALE, ""));
    h.insert(new FITSHeaderItem("BZERO", BZERO, ""));
    h.insert(new FITSHeaderItem("CTYPE1", this.CTYPE1, ""));
    h.insert(new FITSHeaderItem("CTYPE2", this.CTYPE2, ""));
    h.insert(new FITSHeaderItem("CDELT1", pixelAngSize, ""));
    h.insert(new FITSHeaderItem("CDELT2", pixelAngSize, ""));
    h.insert(new FITSHeaderItem("CRPIX1", TILE_WIDTH / 2, ""));
    h.insert(new FITSHeaderItem("CRPIX2", TILE_WIDTH / 2, ""));
    h.insert(new FITSHeaderItem("CRVAL1", cRA, ""));
    h.insert(new FITSHeaderItem("CRVAL2", cDec, ""));
    h.insert(new FITSHeaderItem("DATAMIN", BZERO + BSCALE * minValue, ""));
    h.insert(new FITSHeaderItem("DATAMAX", BZERO + BSCALE * maxValue, ""));
    h.insert(new FITSHeaderItem("ORIGIN", `WCSLight v.${APP_VERSION}`, ""));
    h.insert(
      new FITSHeaderItem(
        "COMMENT",
        "WCSLight developed by F.Giordano and Y.Ascasibar",
        "",
      ),
    );
    h.insert(new FITSHeaderItem("END", "", ""));
    return h;
  }

  setPixelValues(raDecList: TilesRaDecList2, header: FITSHeaderManager): FITS {
    const BITPIX = Number(header.findById("BITPIX")?.value);
    if (!Number.isFinite(BITPIX))
      throw new Error("BITPIX not found or invalid");
    const bytesPerElem = Math.abs(BITPIX) / 8;

    const width = Number(header.findById("NAXIS1")?.value);
    const height = Number(header.findById("NAXIS2")?.value);
    if (!Number.isFinite(width) || width <= 0)
      throw new Error("NAXIS1 not found or invalid");
    if (!Number.isFinite(height) || height <= 0)
      throw new Error("NAXIS2 not found or invalid");

    const BLANK = Number(header.findById("BLANK")?.value);
    const blankBytes = FITSUtils.convertBlankToBytes(BLANK, bytesPerElem);

    const pixels = raDecList.getImagePixelList();
    if (pixels.length !== width * height) {
      throw new Error(
        `Pixel count mismatch: got ${pixels.length}, expected ${width * height}`,
      );
    }

    // Build Map<row, Array<Uint8Array>> per your FITS class constructor
    const rows = new Map<number, Array<Uint8Array>>();
    for (let j = 0; j < height; j++) rows.set(j, new Array<Uint8Array>(width));

    for (let k = 0; k < pixels.length; k++) {
      const row = Math.floor(k / width);
      const col = k % width;
      const u8 = pixels[k].getUint8Value();
      rows.get(row)![col] = u8 ? u8 : new Uint8Array(blankBytes);
    }

    return new FITS(header, rows);
  }
}
