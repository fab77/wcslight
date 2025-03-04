// import { HiPSProj } from "./HiPSProj.js"
import { HiPSFITS } from "../../../lib-esm/projections/HiPS/HiPSFITS.js"
import { HiPSProj } from "../../../lib-esm/projections/HiPS/HiPSProj.js"

// import { HiPSFITS } from "./HiPSFTIS.js"
// import { HiPSFITS } from "./HiPSFTIS.ts"


const fitsPath = "/Users/fabriziogiordano/Desktop/PhD/code/new/wcslight/src/projections/HiPS/Npix278.fits"

const fitsParsed = await HiPSFITS.downloadFITSFile(fitsPath)
console.log(fitsParsed)
const hipsFits = new HiPSFITS(fitsParsed)
console.log(hipsFits)

const hipsProj = new HiPSProj()
// console.log(fits.getFITS())
// const hp = new HiPSPtoj()