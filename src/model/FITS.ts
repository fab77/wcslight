
import { FITSHeader } from 'jsfitsio';

export class FITS {
    _header: FITSHeader[]
    _data: Map<number, Array<Uint8Array>>

    constructor(header: FITSHeader[], data: Map<number, Array<Uint8Array>>) {
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