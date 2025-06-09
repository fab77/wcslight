import { FITSHeaderManager } from 'jsfitsio';
export declare class FITS {
    _header: FITSHeaderManager[];
    _data: Map<number, Array<Uint8Array>>;
    constructor(header: FITSHeaderManager[], data: Map<number, Array<Uint8Array>>);
    get header(): FITSHeaderManager[];
    get data(): Map<number, Uint8Array<ArrayBufferLike>[]>;
}
//# sourceMappingURL=FITS.d.ts.map