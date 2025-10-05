/**
 * SIN (Slant/Orthographic) projection for FITS WCS ('SIN')
 * CTYPE1='RA---SIN', CTYPE2='DEC--SIN'
 *
 * Piano in "gradi proiettivi": convertiamo (x_rad,y_rad) -> (x_deg,y_deg) con RAD2DEG
 * così che CDELT resti in deg/pixel come nelle altre proiezioni.
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
const EPS = 1e-12;

function clamp(x: number, a: number, b: number): number { return Math.max(a, Math.min(b, x)); }
function normalize2pi(a: number): number { a %= 2 * Math.PI; return a < 0 ? a + 2 * Math.PI : a; }
function normalizePi(a: number): number { a = (a + Math.PI) % (2 * Math.PI); return a < 0 ? a + 2 * Math.PI - Math.PI : a - Math.PI; }

// —————————————————————————————————————————————————————————————
// Rotazioni sfera: coord. centrate rispetto a (ra0,dec0)
function toCenteredLonLat(ra: number, dec: number, ra0: number, dec0: number): { lam: number; phi: number } {
  const dlam = normalizePi(ra - ra0); // [-pi,pi)
  const sinφ = Math.sin(dec), cosφ = Math.cos(dec);
  const sinφ0 = Math.sin(dec0), cosφ0 = Math.cos(dec0);

  const sinφp = clamp(sinφ * sinφ0 + cosφ * cosφ0 * Math.cos(dlam), -1, 1);
  const φp = Math.asin(sinφp);
  const y = cosφ * Math.sin(dlam);
  const x = cosφ0 * sinφ - sinφ0 * cosφ * Math.cos(dlam);
  const λp = Math.atan2(y, x);
  return { lam: λp, phi: φp };
}

function fromCenteredLonLat(lam: number, phi: number, ra0: number, dec0: number): { ra: number; dec: number } {
  const sinφ = Math.sin(phi), cosφ = Math.cos(phi);
  const sinφ0 = Math.sin(dec0), cosφ0 = Math.cos(dec0);

  const dec = Math.asin(clamp(sinφ * sinφ0 + cosφ * cosφ0 * Math.cos(lam), -1, 1));
  const y = Math.sin(lam) * cosφ;
  const x = cosφ0 * sinφ - sinφ0 * cosφ * Math.cos(lam);
  let ra = ra0 + Math.atan2(y, x);
  ra = normalize2pi(ra);
  return { ra, dec };
}

// —————————————————————————————————————————————————————————————
// SIN (orthographic) forward/inverse su sfera unitaria (in radianti)
// Forward: x = cosφ * sinΔλ;  y = cosφ0 * sinφ - sinφ0 * cosφ * cosΔλ
function sinForward(lam: number, phi: number, phi0: number): { x: number; y: number; visible: boolean } {
  const cφ = Math.cos(phi), sφ = Math.sin(phi);
  const sφ0 = Math.sin(phi0), cφ0 = Math.cos(phi0);
  const sΔ = Math.sin(lam), cΔ = Math.cos(lam);
  const x = cφ * sΔ;
  const y = cφ0 * sφ - sφ0 * cφ * cΔ;
  // visibile se fronte emisfero: sinφ0 sinφ + cosφ0 cosφ cosΔλ >= 0
  const cos_c = sφ0 * sφ + cφ0 * cφ * cΔ;
  return { x, y, visible: cos_c >= -1e-14 }; // tolleranza numerica
}

// Inverse (azimuthal family con ρ = sin c -> c = asin ρ)
function sinInverse(x: number, y: number, phi0: number): { lam: number; phi: number } | null {
  const ρ = Math.sqrt(x * x + y * y);
  if (ρ > 1 + 1e-12) return null; // fuori dal disco
  const c = Math.asin(Math.min(1, ρ));
  if (ρ < EPS) {
    // centro proiezione
    return { lam: 0, phi: phi0 };
  }
  const sc = Math.sin(c), cc = Math.cos(c);
  const sφ0 = Math.sin(phi0), cφ0 = Math.cos(phi0);

  const phi = Math.asin(clamp(cc * sφ0 + (y * sc * cφ0) / ρ, -1, 1));
  const lam = Math.atan2(x * sc, ρ * cφ0 * cc - y * sφ0 * sc);
  if (!Number.isFinite(lam) || !Number.isFinite(phi)) return null;
  return { lam, phi };
}

// Conversioni piano <-> radianti (unità piano in gradi)
function planeDegToRad(xdeg: number, ydeg: number): { xr: number; yr: number } {
  return { xr: xdeg * DEG2RAD, yr: ydeg * DEG2RAD };
}
function planeRadToDeg(xr: number, yr: number): { xd: number; yd: number } {
  return { xd: xr * RAD2DEG, yd: yr * RAD2DEG };
}

// —————————————————————————————————————————————————————————————

export class SinProjection extends AbstractProjection {
  // minra/mindec = minXdeg/minYdeg del piano
  minra!: number;
  mindec!: number;
  naxis1!: number;
  naxis2!: number;
  bitpix!: number;

  fitsheader: FITSHeaderManager;
  pxvalues: Array<Uint8Array>;

  CTYPE1 = "'RA---SIN'";
  CTYPE2 = "'DEC--SIN'";
  craDeg!: number;  // CRVAL1
  cdecDeg!: number; // CRVAL2
  pxsize!: number;  // CDELT (deg/pixel)
  _wcsname: string;

  constructor() {
    super();
    this._wcsname = "SIN";
    this.pxvalues = [];
    this.fitsheader = new FITSHeaderManager();
  }

  // ——— AbstractProjection: init ———
  async initFromFile(infile: string): Promise<FITSParsed> {
    const fits = await FITSParser.loadFITS(infile);
    if (!fits) throw new Error("FITS is null");

    this.pxvalues = fits.data;
    this.fitsheader = fits.header;

    this.naxis1 = Number(fits.header.findById("NAXIS1")?.value);
    this.naxis2 = Number(fits.header.findById("NAXIS2")?.value);
    this.bitpix = Number(fits.header.findById("BITPIX")?.value);

    this.craDeg  = Number(fits.header.findById("CRVAL1")?.value);
    this.cdecDeg = Number(fits.header.findById("CRVAL2")?.value);

    const pxsize1 = Number(fits.header.findById("CDELT1")?.value);
    const pxsize2 = Number(fits.header.findById("CDELT2")?.value);
    if (pxsize1 !== pxsize2 || isNaN(pxsize1) || isNaN(pxsize2)) {
      throw new Error("Invalid or inconsistent CDELT1/CDELT2");
    }
    this.pxsize = pxsize1;

    // Il centro proiezione (CRVAL1/2) mappa nell'origine (0,0) del piano SIN:
    // impostiamo minX/minY simmetrici rispetto al centro.
    this.minra  = - this.pxsize * this.naxis1 / 2; // minXdeg
    this.mindec = - this.pxsize * this.naxis2 / 2; // minYdeg

    return fits;
  }

  getBytePerValue(): number {
    return Math.abs(this.bitpix / 8);
  }

  // ——— AbstractProjection: header accessors ———
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

  // ——— AbstractProjection: grid builder ———
  getImageRADecList(
    center: Point,
    radius: number,
    pxsize: number,
    naxisWidth: number
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

        const inv = sinInverse(xr, yr, dec0);
        if (!inv) {
          list.addImagePixel(new ImagePixel(Number.NaN, Number.NaN, undefined));
          continue;
        }
        const { lam, phi } = inv;               // coord. centrate
        const { ra, dec } = fromCenteredLonLat(lam, phi, ra0, dec0);
        list.addImagePixel(new ImagePixel(ra * RAD2DEG, dec * RAD2DEG, undefined));
      }
    }
    return list;
  }

  computeNaxisWidth(radius: number, pxsize: number): number {
    return Math.ceil(2 * radius / pxsize);
  }

  // ——— AbstractProjection: pixel <-> world ———
  pix2world(i: number, j: number, pxsize: number, minPlaneXdeg: number, minPlaneYdeg: number): Point {
    const xDeg = i * pxsize + minPlaneXdeg;
    const yDeg = j * pxsize + minPlaneYdeg;
    const { xr, yr } = planeDegToRad(xDeg, yDeg);

    const ra0 = this.craDeg * DEG2RAD;
    const dec0 = this.cdecDeg * DEG2RAD;

    const inv = sinInverse(xr, yr, dec0);
    if (!inv) return new Point(CoordsType.ASTRO, NumberType.DEGREES, Number.NaN, Number.NaN);

    const { lam, phi } = inv;
    const { ra, dec } = fromCenteredLonLat(lam, phi, ra0, dec0);
    return new Point(CoordsType.ASTRO, NumberType.DEGREES, ra * RAD2DEG, dec * RAD2DEG);
  }

  world2pix(raDecList: TilesRaDecList2): TilesRaDecList2 {
    const bytesXvalue = this.getBytePerValue();
    const blank = Number(this.fitsheader.findById("BLANK")?.value);
    const blankBytes = ParseUtils.convertBlankToBytes(blank, bytesXvalue);

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

      const { lam, phi } = toCenteredLonLat(raDeg * DEG2RAD, decDeg * DEG2RAD, ra0, dec0);
      const fwd = sinForward(lam, phi, dec0);
      if (!fwd.visible) {
        px.setij(-1, -1);
        px.setValue(blankBytes, this.bitpix);
        continue;
      }

      const { xd, yd } = planeRadToDeg(fwd.x, fwd.y);
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

  // ——— FITS writer ———
  generateFITSFile(
    pixelAngSize: number,
    BITPIX: number,
    TILE_WIDTH: number,
    BLANK: number, BZERO: number, BSCALE: number,
    cRA: number, cDec: number,
    minValue: number, maxValue: number,
    raDecWithValues: TilesRaDecList2
  ): FITS {
    const header = this.prepareHeader(
      pixelAngSize,
      BITPIX,
      TILE_WIDTH,
      BLANK, BZERO, BSCALE,
      cRA, cDec,
      minValue, maxValue
    );
    return this.setPixelValues(raDecWithValues, header);
  }

  prepareHeader(
    pixelAngSize: number,
    BITPIX: number,
    TILE_WIDTH: number,
    BLANK: number, BZERO: number, BSCALE: number,
    cRA: number, cDec: number,
    minValue: number, maxValue: number
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
    h.insert(new FITSHeaderItem("COMMENT", "WCSLight developed by F.Giordano and Y.Ascasibar", ""));
    h.insert(new FITSHeaderItem("END", "", ""));
    return h;
  }

  setPixelValues(raDecList: TilesRaDecList2, header: FITSHeaderManager): FITS {
    const BITPIX = Number(header.findById("BITPIX")?.value);
    if (!Number.isFinite(BITPIX)) throw new Error("BITPIX not found or invalid");
    const bytesPerElem = Math.abs(BITPIX) / 8;

    const width  = Number(header.findById("NAXIS1")?.value);
    const height = Number(header.findById("NAXIS2")?.value);
    if (!Number.isFinite(width) || width <= 0)  throw new Error("NAXIS1 not found or invalid");
    if (!Number.isFinite(height) || height <= 0) throw new Error("NAXIS2 not found or invalid");

    const BLANK = Number(header.findById("BLANK")?.value);
    const blankBytes = ParseUtils.convertBlankToBytes(BLANK, bytesPerElem);

    const pixels = raDecList.getImagePixelList();
    if (pixels.length !== width * height) {
      throw new Error(`Pixel count mismatch: got ${pixels.length}, expected ${width * height}`);
    }

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
