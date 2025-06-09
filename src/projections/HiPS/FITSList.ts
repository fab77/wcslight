import { FITSParser } from "jsfitsio";
import { HiPSFITS } from "./HiPSFITS.js";

export class FITSList{
    private fitslist: Map<number, HiPSFITS> = new Map()

    constructor(){}

    getFITSList(): Map<number, HiPSFITS>{
        return this.fitslist
    }

    getFITS(tileno: number): HiPSFITS | null {
        const fits = this.fitslist.get(tileno)
        return fits === undefined ? null : fits
    }

    async addFITSByURL(url: string) {
        const fits = await FITSParser.loadFITS(url)
        const hipsFits = new HiPSFITS(fits, null, null )
        this.fitslist.set(hipsFits.getTileno(), hipsFits)
    }

    addFITS(fits: HiPSFITS) {
        const tileno = fits.getTileno()
        this.fitslist.set(tileno, fits)
    }
}