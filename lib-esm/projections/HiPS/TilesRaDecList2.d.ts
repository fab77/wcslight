import { ImagePixel } from "./ImagePixel.js";
export declare class TilesRaDecList2 {
    tileList: Array<number>;
    imagePixelList: ImagePixel[];
    constructor();
    findImagePixel(i: number, j: number): ImagePixel | null;
    getImagePixelsByTile(tileno: number): ImagePixel[];
    getImagePixelList(): ImagePixel[];
    getTilesList(): number[];
    addImagePixel(imgpx: ImagePixel): void;
    addTileNumber(tileno: number): void;
}
//# sourceMappingURL=TilesRaDecList2.d.ts.map