// // import { FITSParser } from 'fitsparser/FITSParser-node';
// // import { FITSHeader } from 'fitsparser/model/FITSHeader';
// // import { FITSHeaderItem } from 'fitsparser/model/FITSHeaderItem';
// // import { FITSParsed } from 'fitsparser/model/FITSParsed';
export {};
// import { FITSHeaderManager } from 'jsfitsio';
// import { FITSParsed } from 'jsfitsio';
// import { ImagePixel } from '../model/ImagePixel.js';
// import { AbstractProjection } from './AbstractProjection.js';
// import {Point} from '../model/Point.js';
// export class TestProj extends AbstractProjection{
//     _minra: number;
//     _mindec: number;
//     _fitsheader: FITSHeaderManager[];
//     _infile: string;
//     _craDeg: number;
//     _cdecDeg: number;
//     _pxsize1: number;
//     _pxsize2: number;
//     _pxvalues: Map<number, Array<Uint8Array>>;
//     _minphysicalval: number;
//     _maxphysicalval: number;
//     _wcsname: string;
//     constructor() {
//         super("RA---TST", "DEC--TST")
//         // this._wcsname = "MER"; // TODO check WCS standard and create ENUM
//         // this._pxvalues = new Map<number, Array<Uint8Array>>();
//         // const fh = new FITSHeader();
//         // const fp = new FITSParser("./notexistent/");
//         // const fp = FITSParser.loadFITS("./notexistent/");
//         // const fhi = new FITSHeaderItem("mykey", "myvalue", "mycomment");
//     }
//     public get fitsUsed(): String[] {
//         throw new Error('Method not implemented.');
//     }
//     public initFromFile(fitsfilepath?: string, hipsURI?: string, pxsize?: number, order?: number): Promise<FITSParsed> {
//         throw new Error('Method not implemented.');
//     }
//     public prepareFITSHeader(fitsHeaderParams: FITSHeaderManager): FITSHeaderManager[] {
//         throw new Error('Method not implemented.');
//     }
//     public getFITSHeader(): FITSHeaderManager[] {
//         throw new Error('Method not implemented.');
//     }
//     public getCommonFitsHeaderParams(): FITSHeaderManager {
//         throw new Error('Method not implemented.');
//     }
//     public extractPhysicalValues(fits: FITSParsed): number[][] {
//         throw new Error('Method not implemented.');
//     }
//     public getPixValues(inputPixelsList: ImagePixel[]): Promise<Uint8Array> {
//         throw new Error('Method not implemented.');
//     }
//     public computeSquaredNaxes(d: number, ps: number): void {
//         throw new Error('Method not implemented.');
//     }
//     public setPxsValue(values: Uint8Array, fitsHeaderParams: FITSHeaderManager): Map<number, Uint8Array[]> {
//         throw new Error('Method not implemented.');
//     }
//     public getImageRADecList(center: Point, radius: number, pxsize: number):  Array<[number, number]> {
//         throw new Error('Method not implemented.');
//     }
//     public pix2world(i: number, j: number): Point {
//         throw new Error('Method not implemented.');
//     }
//     public world2pix(radeclist: number[][]): ImagePixel[] {
//         throw new Error('Method not implemented.');
//     }
// }
//# sourceMappingURL=TestProj.js.map