import { FITS } from "../../model/FITS.js"

export class CutoutResult {
    fits: FITS
    fitsused: string[]

    constructor(fits: FITS, fitsused: string[]){
        this.fits = fits
        this.fitsused = fitsused
    }

    get fit(): FITS {
        return this.fits
    }

    get fitsUsed(): string[] {
        return this.fitsUsed
    }
}