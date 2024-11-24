import { FITSHeader } from 'jsfitsio';
export declare class FITS {
    _header: FITSHeader[];
    _data: Map<number, Array<Uint8Array>>;
    constructor(header: FITSHeader[], data: Map<number, Array<Uint8Array>>);
    get header(): FITSHeader[];
    get data(): Map<number, Uint8Array[]>;
}
//# sourceMappingURL=FITS.d.ts.map