import { FITS } from "../../model/FITS.js"
import { AbstractProjection } from "../AbstractProjection.js"
import { RADecMinMaxCentral } from "../RADecMinMaxCentral.js"

export class CutoutResult {
    fits: FITS
    fitsused: string[]
    projection: AbstractProjection
    raDecMinMaxCentral: RADecMinMaxCentral
    pxsize: number


    constructor(fits: FITS, fitsused: string[], projection: AbstractProjection, raDecMinMaxCentral: RADecMinMaxCentral, pxsize: number) {
        this.fits = fits
        this.fitsused = fitsused
        this.projection = projection
        this.raDecMinMaxCentral = raDecMinMaxCentral
        this.pxsize = pxsize
    }

}