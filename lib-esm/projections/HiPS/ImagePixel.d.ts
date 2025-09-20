export declare class ImagePixel {
    i: number;
    j: number;
    ra: number;
    dec: number;
    tileno: number | undefined;
    uint8value: Uint8Array | null;
    value: number | null;
    constructor(i: number, j: number, tileno: number | undefined);
    constructor(ra: number, dec: number, tileno: number | undefined);
    geti(): number;
    getj(): number;
    getRADeg(): number;
    getDecDeg(): number;
    getUint8Value(): Uint8Array<ArrayBufferLike> | null;
    getValue(): number | null;
    setValue(value: Uint8Array, bitpix: number): void;
    setTileNumber(tileno: number): void;
    setij(i: number, j: number): void;
    setRADecDeg(ra: number, dec: number): void;
}
//# sourceMappingURL=ImagePixel.d.ts.map