
import { FITSHeaderManager } from 'jsfitsio';

export class FITS {
    _header: FITSHeaderManager[]
    _data: Map<number, Array<Uint8Array>>

    constructor(header: FITSHeaderManager[], data: Map<number, Array<Uint8Array>>) {
        this._header = header
        this._data = data
    }

    get header() {
        return this._header
    }
    
    get data() {
        return this._data
    }

}