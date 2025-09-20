import { FITSHeaderManager } from 'jsfitsio';
export declare class FITS {
    private header;
    private payload;
    constructor(header: FITSHeaderManager, data: Map<number, Array<Uint8Array>>);
    setData(data: Map<number, Array<Uint8Array>>): void;
    getHeader(): FITSHeaderManager;
    getData(): Uint8Array<ArrayBufferLike>[];
}
//# sourceMappingURL=FITS.d.ts.map