import { FITSHeaderManager, FITSHeaderItem } from "jsfitsio";
import { FITSParsed } from "jsfitsio";
// import { AstroCoords } from "src/model/AstroCoords";
import { ImagePixel } from "../model/ImagePixel.js";
import { Point } from "../model/Point.js";
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
  private _naxis1!: number;
  private _naxis2!: number;
  private _pxsize: number;
  private _ctype1: string;
  private _ctype2: string;

  constructor(
    ctype1: string,
    ctype2: string,
    naxis1 = 0,
    naxis2 = 0,
    pxsize = 0
  ) {
    this._ctype1 = ctype1;
    this._ctype2 = ctype2;
    this._naxis1 = naxis1;
    this._naxis2 = naxis2;
    this._pxsize = pxsize;
  }

  protected get naxis1() {
    return this._naxis1;
  }

  protected set naxis1(value: number) {
    this._naxis1 = value;
  }

  protected get naxis2() {
    return this._naxis2;
  }

  protected set naxis2(value: number) {
    this._naxis2 = value;
  }

  protected get pxsize() {
    return this._pxsize;
  }

  protected set pxsize(value: number) {
    this._pxsize = value;
  }

  protected get ctype1() {
    return this._ctype1;
  }

  protected set ctype1(value: string) {
    this._ctype1 = value;
  }

  protected get ctype2() {
    return this._ctype2;
  }

  protected set ctype2(value: string) {
    this._ctype2 = value;
  }

  public abstract initFromFile(
    fitsfilepath?: string,
    hipsURI?: string,
    pxsize?: number,
    order?: number
  ): Promise<FITSParsed | undefined>;

  public abstract prepareFITSHeader(fitsHeaderParams: FITSHeaderManager): FITSHeaderManager[];

  public abstract getFITSHeader(): FITSHeaderManager[];

  public abstract getCommonFitsHeaderParams(): FITSHeaderManager;

  public abstract extractPhysicalValues(fits: FITSParsed): number[][];

  public abstract getPixValues(
    inputPixelsList: ImagePixel[]
  ): Promise<Uint8Array | undefined>;

  public abstract setPxsValue(
    values: Uint8Array,
    fitsHeaderParams: FITSHeaderManager
  ): Map<number, Array<Uint8Array>>;

  public abstract getImageRADecList(
    center: Point,
    radius: number,
    pxsize: number
  ): Array<[number, number]>;

  public abstract pix2world(i: number, j: number): Point;

  public abstract get fitsUsed(): String[];

  public abstract world2pix(radeclist: number[][]): ImagePixel[];

  // public abstract generateFITSWithNaN(): FITS;

  public generateFITSWithNaN(): FITS {
    if (!this.naxis1 || !this.naxis2) {
      throw new Error(
        "NAXIS1 and NAXIS2 must be initialized before generating FITS."
      );
    }

    let fitsheaderList: FITSHeaderManager[] = [];

    let fitsheader: FITSHeaderManager = new FITSHeaderManager();

    fitsheader.insert(new FITSHeaderItem("NAXIS1", this.naxis1));
    fitsheader.insert(new FITSHeaderItem("NAXIS2", this.naxis2));
    fitsheader.insert(new FITSHeaderItem("NAXIS", 2));
    fitsheader.insert(new FITSHeaderItem("BITPIX", "-64"));
    fitsheader.insert(new FITSHeaderItem("SIMPLE", "T"));
    fitsheader.insert(new FITSHeaderItem("BSCALE", 1));
    fitsheader.insert(new FITSHeaderItem("BZERO", 0));

    fitsheader.insert(new FITSHeaderItem("CTYPE1", this.ctype1));
    fitsheader.insert(new FITSHeaderItem("CTYPE2", this.ctype2));
    fitsheader.insert(new FITSHeaderItem("CDELT1", this.pxsize)); // ??? Pixel spacing along axis 1 ???
    fitsheader.insert(new FITSHeaderItem("CDELT2", this.pxsize)); // ??? Pixel spacing along axis 2 ???
    fitsheader.insert(new FITSHeaderItem("CRPIX1", this.naxis1 / 2)); // central/reference pixel i along naxis1
    fitsheader.insert(new FITSHeaderItem("CRPIX2", this.naxis2 / 2)); // central/reference pixel j along naxis2
    fitsheader.insert(new FITSHeaderItem("CRVAL1", NaN)); // central/reference pixel RA
    fitsheader.insert(new FITSHeaderItem("CRVAL2", NaN)); // central/reference pixel Dec

    fitsheader.insert(new FITSHeaderItem("ORIGIN", "'WCSLight v.0.x'"));
    fitsheader.insert(
      new FITSHeaderItem(
        "COMMENT",
        "'WCSLight v0.x developed by F.Giordano and Y.Ascasibar'"
      )
    );
    fitsheader.insert(new FITSHeaderItem("END"));

    fitsheaderList.push(fitsheader);

    let bytesXelem = 8;
    // why not usign a simple arrays?
    let pv = new Map<number, Array<Uint8Array>>();
    pv.set(0, new Array<Uint8Array>(this.naxis2))
    pv.get(0)
    for (let r = 0; r < this.naxis2; r++) {
      pv.get(0)[r] = new Uint8Array(this.naxis1 * bytesXelem);
      pv.get(0)[r].fill(255);
    }

    const fitsNan: FITS = new FITS(fitsheaderList, pv);

    return fitsNan;
  }

  public computeSquaredNaxes(d: number, ps: number): void {
    // first approximation to be checked
    this._naxis1 = Math.ceil(d / ps);
    this._naxis2 = this._naxis1;
    this._pxsize = ps;
  }
}
