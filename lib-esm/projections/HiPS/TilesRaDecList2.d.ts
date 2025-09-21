import { MinMaxValue } from "../MinMaxValue.js";
import { RADecMinMaxCentral } from "../RADecMinMaxCentral.js";
import { ImagePixel } from "./ImagePixel.js";
export declare class TilesRaDecList2 {
    tileList: Array<number>;
    imagePixelList: ImagePixel[];
    minPixelValue: number | null;
    maxPixelValue: number | null;
    BZERO: number | null;
    BSCALE: number | null;
    BLANK: number | null;
    constructor();
    setBZERO(BZERO: number): void;
    setBSCALE(BSCALE: number): void;
    setBLANK(BLANK: number): void;
    getBZERO(): number | null;
    getBSCALE(): number | null;
    getBLANK(): number | null;
    findImagePixel(i: number, j: number): ImagePixel | null;
    getImagePixelsByTile(tileno: number): ImagePixel[];
    getImagePixelList(): ImagePixel[];
    getTilesList(): number[];
    addImagePixel(imgpx: ImagePixel): void;
    addTileNumber(tileno: number): void;
    computeRADecMinMaxCentral(): RADecMinMaxCentral | null;
    setMinMaxValue(value: number | null): void;
    getMinMaxValues(): MinMaxValue | null;
}
//# sourceMappingURL=TilesRaDecList2.d.ts.map