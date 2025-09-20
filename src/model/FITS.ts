
import { FITSHeaderManager } from 'jsfitsio';

export class FITS {

    private header!: FITSHeaderManager
    private payload: Uint8Array<ArrayBufferLike>[] = []

    constructor(header: FITSHeaderManager, data: Map<number, Array<Uint8Array>>) {
        this.header = header
        this.setData(data)
    }

    setData(data: Map<number, Array<Uint8Array>>){
        this.payload = Array.from(data.values()).flatMap(row => row);
    }

    getHeader() {
        return this.header
    }
    
    getData() {
        return this.payload
    }



}