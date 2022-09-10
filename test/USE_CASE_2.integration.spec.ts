import { CoordsType } from "../src/model/CoordsType";
import { NumberType } from "../src/model/NumberType";
import { Point } from "../src/model/Point";
import { HiPSProjection } from "../src/projections/HiPSProjection";




describe("USE CASE 2:  Retrieve HiPS Files by HiPS baseURL:", function () {
    it("USE CASE 2.0: Retrieve HiPS Files by remote baseURL and pxsize", async () => {
        let hp = new HiPSProjection();
        let pxsize = 0.001; // degrees
        hp.initFromHiPSLocationAndPxSize('http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/', pxsize);
        let center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
        let radiusDeg = 0.05;
        let raDecList: number[][] = hp.getImageRADecList(center, radiusDeg);

        const inputPixelsList = hp.world2pix(raDecList);
        const destDir = './test/output/UC2/2_0/';
        await hp.getFITSFiles(inputPixelsList, destDir)
    });


    // it("USE CASE 2.1: Retrieve HiPS Files by local baseURL and pxsize", async () => {
    //     let hp = new HiPSProjection();
    //     let pxsize = 0.001; // degrees
    //     hp.initFromHiPSLocationAndPxSize('/local-hips-basedir/', pxsize);
    //     let center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 20.43, 19.23);
    //     let radiusDeg = 0.0005;
    //     let raDecList: number[][] = hp.getImageRADecList(center, radiusDeg);

    //     const inputPixelsList = hp.world2pix(raDecList);
    //     const destDir = '/myLocalDestinationPath/';
    //     await hp.getFITSFiles(inputPixelsList, destDir)
    //     console.log("Files stored in " + destDir);
    // });


    it("USE CASE 2.2: Retrieve HiPS Files by remote baseURL and order", async () => {
        let hp = new HiPSProjection();
        let order = 7; // degrees
        hp.initFromHiPSLocationAndOrder('http://skies.esac.esa.int/Herschel/normalized/PACS_hips160/', order);
        let center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 248.3529, -36.6464);
        let radiusDeg = 0.05;
        let raDecList: number[][] = hp.getImageRADecList(center, radiusDeg);

        const inputPixelsList = hp.world2pix(raDecList);
        const destDir = './test/output/UC2/2_2/';
        await hp.getFITSFiles(inputPixelsList, destDir)
    });


    // it("USE CASE 2.3: Retrieve HiPS Files by local baseURL and order", async () => {
    //     let hp = new HiPSProjection();
    //     let order = 7; // degrees
    //     hp.initFromHiPSLocationAndOrder('/local-hips-basedir/', order);
    //     let center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 20.43, 19.23);
    //     let radiusDeg = 0.0005;
    //     let raDecList: number[][] = hp.getImageRADecList(center, radiusDeg);

    //     const inputPixelsList = hp.world2pix(raDecList);
    //     const destDir = '/myLocalDestinationPath/';
    //     await hp.getFITSFiles(inputPixelsList, destDir)
    //     console.log("Files stored in " + destDir);
    // });


});





