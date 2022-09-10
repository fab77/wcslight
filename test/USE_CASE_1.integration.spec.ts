import { FITSParsed } from "../../FITSParser/src/model/FITSParsed";
import { FITSParser } from "../../FITSParser/src/FITSParser-node";
import { HiPSProjection } from "../src/projections/HiPSProjection";
import { MercatorProjection } from "../src/projections/MercatorProjection";




describe("USE CASE 1: Single File Processing:", function () {
    // it("", async () => {
    // });

    it("USE CASE 1.0: retrieve pixel's values from FITS file in HiPS projection (single file: remote)", async () => {
        let hp = new HiPSProjection();
        // let myfits: FITSParsed;
        let physicalValues: number[][];
        let t = await hp.initFromFile("http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/Norder8/Dir40000/Npix47180.fits")
            .then((fits) => {
                // myfits = fits;
                physicalValues = hp.extractPhysicalValues(fits);
                return fits;
            });

        FITSParser.writeFITS(t.header, t.data, "./test/output/UC1_0_Npix47180.fits");

    });

    it("USE CASE 1.1: retrieve pixel's values from FITS file in HiPS projection (single file: local)", async () => {
        let hp = new HiPSProjection();
        // let myfits: FITSParsed;
        let physicalValues: number[][];
        let t = await hp.initFromFile('./test/input/Npix43349.fits')
            .then( (fits) => {
                // myfits = fits;
                physicalValues = hp.extractPhysicalValues(fits);
                return fits;
            });
        FITSParser.writeFITS(t.header, t.data, "./test/output/UC1_1_Npix43349.fits");
    
    });

    it("USE CASE 1.2: retrieve pixel's values from FITS file in Mercator projection (single file: local)", async () => {
        let mp = new MercatorProjection();
        // let myfits: FITSParsed;
        let physicalValues: number[][];
        let t = await mp.initFromFile('./test/input/Mercator.fits')
            .then((fits) => {
                // myfits = fits;
                physicalValues = mp.extractPhysicalValues(fits);
                // console.log(physicalValues);
                return fits;
            });

        FITSParser.writeFITS(t.header, t.data, "./test/output/UC1_2_Mercator.fits");
    });
});





