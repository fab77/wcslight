import { HiPSPtoj } from "./HiPSProp.js"
import { HiPSFTIS } from "./HiPSFITs.js"


const fitsPath = "./test.fits"
const fits = new HiPSFTIS(fitsPath)
console.log(fits)
// const hp = new HiPSPtoj()