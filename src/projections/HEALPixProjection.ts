
import { FITSHeader } from '../../../FITSParser-test-20220905/src/model/FITSHeader';
import { FITSParsed } from '../../../FITSParser-test-20220905/src/model/FITSParsed';
import { ImagePixel } from "../model/ImagePixel";
import {Point} from "../model/Point";
import {AbstractProjection} from "./AbstractProjection";


export class HEALPixProjection extends AbstractProjection {
    public initFromFile(fitsfilepath?: string, hipsURI?: string, pxsize?: number, order?: number): Promise<FITSParsed> {
        throw new Error('Method not implemented.');
    }
    public prepareFITSHeader(fitsHeaderParams: FITSHeader): FITSHeader[] {
        throw new Error('Method not implemented.');
    }
    public getFITSHeader(): FITSHeader[] {
        throw new Error('Method not implemented.');
    }
    public getCommonFitsHeaderParams(): FITSHeader {
        throw new Error('Method not implemented.');
    }
    public extractPhysicalValues(fits: FITSParsed): number[][] {
        throw new Error('Method not implemented.');
    }
    public getPixValues(inputPixelsList: ImagePixel[]): Promise<Uint8Array> {
        throw new Error('Method not implemented.');
    }
    public computeSquaredNaxes(d: number, ps: number): void {
        throw new Error('Method not implemented.');
    }
    public setPxsValue(values: Uint8Array, fitsHeaderParams: FITSHeader): Map<number, Uint8Array[]> {
        throw new Error('Method not implemented.');
    }
    public getImageRADecList(center: Point, radius: number, pxsize: number): number[][] {
        throw new Error('Method not implemented.');
    }
    public pix2world(i: number, j: number): Point {
        throw new Error('Method not implemented.');
    }
    public world2pix(radeclist: number[][]): ImagePixel[] {
        throw new Error('Method not implemented.');
    }
    

}