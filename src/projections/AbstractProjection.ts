import { FITSHeaderManager } from "jsfitsio";
// import { FITSHeaderManager, FITSHeaderItem } from "jsfitsio";
// import { FITSParsed } from "jsfitsio";
// import { AstroCoords } from "src/model/AstroCoords";
// import { ImagePixel } from "../model/ImagePixel.js";
import { Point } from "../model/Point.js";
// import { FITS } from "../model/FITS.js";
import { TilesRaDecList2 } from "./hips/TilesRaDecList2.js";
import { FITS } from "../model/FITS.js";

/**
 * Summary. (bla bla bla)
 *
 * Description. (bla bla bla)
 *
 * @link   github https://github.com/fab77/wcslight
 * @author Fabrizio Giordano <fabriziogiordano77@gmail.com>
 */

export abstract class AbstractProjection {

  public abstract getFITSHeader(): FITSHeaderManager;

  public abstract getCommonFitsHeaderParams(): FITSHeaderManager;

  public abstract setPixelValues(
    values: TilesRaDecList2,
    header: FITSHeaderManager,
  ): FITS;

  public abstract getImageRADecList(
    center: Point, radius: number,
    pxsize: number, naxisWidth: number
  ): TilesRaDecList2;

  public abstract pix2world(i: number, j: number): Point;

  public abstract world2pix(radeclist: TilesRaDecList2): TilesRaDecList2;

  public abstract computeNaxisWidth(radius: number, pxsize: number): number;

  public abstract generateFITSFile(pixelAngSize: number,
    BITPIX: number,
    TILE_WIDTH: number,
    BLANK: number, BZERO: number, BSCALE: number,
    cRA: number, cDec: number,
    minValue: number, maxValue: number,
    raDecWithValues: TilesRaDecList2): FITS
}
