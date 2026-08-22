import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { FITSParser } from "jsfitsio";

import {
  WCSLight,
  Point,
  CoordsType,
  NumberType,
  CartesianProjection,
  MercatorProjection,
  SinProjection,
  AitoffProjection,
} from "../../lib-esm/index.js";

import { startHiPSFixtureServer } from "../helpers/hips-fixture-server.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, "../output/conversions");

const CENTER_RA = 160.752615;
const CENTER_DEC = -64.4051202;

const RADIUS_DEG = 0.05;
const PIXEL_SIZE_DEG = 0.005;

/*
 * Expected output width:
 *
 * ceil((2 * radius) / pixelSize)
 *
 * ceil((2 * 0.05) / 0.005)
 * = 20
 */
const EXPECTED_WIDTH = 20;

const EXPECTED_BITPIX = 16;

const EXPECTED_BLANK = -32768;
const EXPECTED_BZERO = 50;

const projections = [
  {
    name: "Cartesian",
    filename: "hips-to-car.fits",
    Projection: CartesianProjection,
    ctype1: "RA---CAR",
    ctype2: "DEC--CAR",
  },
  {
    name: "Mercator",
    filename: "hips-to-mer.fits",
    Projection: MercatorProjection,
    ctype1: "RA---MER",
    ctype2: "DEC--MER",
  },
  {
    name: "SIN",
    filename: "hips-to-sin.fits",
    Projection: SinProjection,
    ctype1: "RA---SIN",
    ctype2: "DEC--SIN",
  },
  {
    name: "Aitoff",
    filename: "hips-to-ait.fits",
    Projection: AitoffProjection,
    ctype1: "RA---AIT",
    ctype2: "DEC--AIT",
  },
];

async function validateOutputFITS(outputPath, expectedCtype1, expectedCtype2) {
  const stat = await fs.stat(outputPath);

  assert.ok(stat.size > 0, `Expected non-empty FITS file: ${outputPath}`);

  const fitsFile = await FITSParser.loadFITSFile(outputPath);

  assert.ok(fitsFile, `Unable to read generated FITS file: ${outputPath}`);

  const image = fitsFile.primaryHDU;

  assert.ok(image, `Generated FITS file has no Primary HDU: ${outputPath}`);

  assert.equal(image.naxis, 2);

  assert.deepEqual(image.shape, [EXPECTED_WIDTH, EXPECTED_WIDTH]);

  assert.equal(image.bitpix, EXPECTED_BITPIX);

  assert.ok(image.rawData);

  const bytesPerElement = Math.abs(image.bitpix) / 8;

  assert.equal(
    image.rawData.byteLength,
    EXPECTED_WIDTH * EXPECTED_WIDTH * bytesPerElement,
  );

  const ctype1 = String(image.header.findById("CTYPE1")?.value);

  const ctype2 = String(image.header.findById("CTYPE2")?.value);

  assert.ok(
    ctype1.includes(expectedCtype1),
    `Expected CTYPE1=${expectedCtype1}, got ${ctype1}`,
  );

  assert.ok(
    ctype2.includes(expectedCtype2),
    `Expected CTYPE2=${expectedCtype2}, got ${ctype2}`,
  );

  const blank = Number(image.header.findById("BLANK")?.value);

  const bzero = Number(image.header.findById("BZERO")?.value);

  const bscale = Number(image.header.findById("BSCALE")?.value);

  assert.equal(blank, EXPECTED_BLANK);

  assert.equal(bzero, EXPECTED_BZERO);

  assert.ok(Number.isFinite(bscale));

  const datamin = Number(image.header.findById("DATAMIN")?.value);

  const datamax = Number(image.header.findById("DATAMAX")?.value);

  assert.ok(Number.isFinite(datamin));

  assert.ok(Number.isFinite(datamax));

  assert.ok(datamin <= datamax);

  const crval1 = Number(image.header.findById("CRVAL1")?.value);

  const crval2 = Number(image.header.findById("CRVAL2")?.value);

  assert.ok(Number.isFinite(crval1));

  assert.ok(Number.isFinite(crval2));

  /*
   * The generated projection center should remain
   * close to the requested cutout center.
   *
   * Do not require exact equality because the center
   * is computed from the generated RA/Dec grid.
   */
  assert.ok(Math.abs(crval1 - CENTER_RA) < 1, `Unexpected CRVAL1=${crval1}`);

  assert.ok(Math.abs(crval2 - CENTER_DEC) < 1, `Unexpected CRVAL2=${crval2}`);

  return image;
}

for (const { name, filename, Projection, ctype1, ctype2 } of projections) {
  test(
    `HiPS -> ${name} produces a valid FITS image`,
    {
      timeout: 30_000,
    },
    async () => {
      const server = await startHiPSFixtureServer();

      const outputPath = path.join(OUTPUT_DIR, filename);

      try {
        await fs.mkdir(OUTPUT_DIR, {
          recursive: true,
        });

        await fs.rm(outputPath, {
          force: true,
        });

        const center = new Point(
          CoordsType.ASTRO,
          NumberType.DEGREES,
          CENTER_RA,
          CENTER_DEC,
        );

        const projection = new Projection();

        const result = await WCSLight.hipsCutoutToFITS(
          center,
          RADIUS_DEG,
          PIXEL_SIZE_DEG,
          server.url,
          projection,
          null,
          outputPath,
        );

        assert.ok(result, `HiPS -> ${name} returned null`);

        assert.ok(result.fits);

        assert.ok(result.fitsused.length > 0);

        assert.equal(result.pxsize, PIXEL_SIZE_DEG);

        /*
         * The output file is written directly
         * to outputPath by hipsCutoutToFITS().
         */
        const stat = await fs.stat(outputPath);

        assert.ok(stat.size > 0);

        const image = await validateOutputFITS(outputPath, ctype1, ctype2);

        /*
         * Check that the generated image contains
         * actual data and not only BLANK pixels.
         */
        assert.ok(image.typedData);

        const values = Array.from(image.typedData);

        assert.equal(values.length, EXPECTED_WIDTH * EXPECTED_WIDTH);

        const hasNonBlankValue = values.some(
          (value) => Number(value) !== EXPECTED_BLANK,
        );

        assert.ok(
          hasNonBlankValue,
          `HiPS -> ${name} generated only BLANK pixels`,
        );
      } finally {
        /*
         * Keep outputPath for manual validation
         * in DS9.
         */
        await server.close();
      }
    },
  );
}
