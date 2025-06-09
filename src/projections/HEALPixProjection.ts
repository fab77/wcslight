
// import { FITSHeaderManager } from 'jsfitsio';
// import { FITSParsed } from 'jsfitsio';
// import { ImagePixel } from "../model/ImagePixel.js";
// import {Point} from "../model/Point.js";
// import {AbstractProjection} from "./AbstractProjection.js";


// export class HEALPixProjection extends AbstractProjection {
    
//     constructor() {
//         super("'RA---HPX'", "'DEC--HPX'")
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
    
//     public setPxsValue(values: Uint8Array, fitsHeaderParams: FITSHeaderManager): Map<number, Uint8Array[]> {
//         throw new Error('Method not implemented.');
//     }
//     public getImageRADecList(center: Point, radius: number, pxsize: number): Array<[number, number]> {
//         throw new Error('Method not implemented.');
//     }
//     public pix2world(i: number, j: number): Point {
//         throw new Error('Method not implemented.');
//     }
//     public world2pix(radeclist: number[][]): ImagePixel[] {
//         throw new Error('Method not implemented.');
//     }
    

// }