


// import { FITSParser } from 'fitsparser/FITSParser-node';
// import { FITSHeader } from 'fitsparser/model/FITSHeader';
// import { FITSHeaderItem } from 'fitsparser/model/FITSHeaderItem';
// import { FITSParsed } from 'fitsparser/model/FITSParsed';


import { FITSParser } from '../../../FITSParser/src/FITSParser-node';
import { FITSHeader } from '../../../FITSParser/src/model/FITSHeader';
import { FITSHeaderItem } from '../../../FITSParser/src/model/FITSHeaderItem';
import { FITSParsed } from '../../../FITSParser/src/model/FITSParsed';

import { ImagePixel } from 'src/model/ImagePixel';
import { AbstractProjection } from './AbstractProjection';
import {Point} from 'src/model/Point';

export class TestProj implements AbstractProjection{
    
    _minra: number;
    _mindec: number;
    _naxis1: number;
    _naxis2: number;
    _pxsize: number;
    _fitsheader: FITSHeader[];
    _infile: string;
    _ctype1: string; // TODO should be RA ENUM
    _ctype2: string; // TODO should be Dec ENUM
    _craDeg: number;
    _cdecDeg: number;
    _pxsize1: number;
    _pxsize2: number;
    _pxvalues: Map<number, Array<Uint8Array>>;
    _minphysicalval: number;
    _maxphysicalval: number;
    _wcsname: string;
    constructor() {
        this._wcsname = "MER"; // TODO check WCS standard and create ENUM
        this._ctype1 = "RA---MER";
        this._ctype2 = "DEC--MER";
        this._pxvalues = new Map<number, Array<Uint8Array>>();
        const fh = new FITSHeader();
        const fp = new FITSParser("./notexistent/");
        const fhi = new FITSHeaderItem("mykey", "myvalue", "mycomment");


    }
    
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