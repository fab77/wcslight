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
} from "../../lib-esm/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURE_DIR = path.resolve(__dirname, "../fixtures/projections");

const OUTPUT_DIR = path.resolve(__dirname, "../output/conversions");

const CENTER_RA = 180;
const CENTER_DEC = 0;

const RADIUS_DEG = 0.5;
const PIXEL_SIZE_DEG = 0.1;

const projections = [
  {
    name: "Cartesian",
    fixture: "cartesian.fits",
    prefix: "car-to-hips",
  },
  {
    name: "Mercator",
    fixture: "mercator.fits",
    prefix: "mer-to-hips",
  },
  {
    name: "SIN",
    fixture: "sin.fits",
    prefix: "sin-to-hips",
  },
  {
    name: "Aitoff",
    fixture: "aitoff.fits",
    prefix: "ait-to-hips",
  },
];

/**
 * Validate a FITS tile generated in HiPS/HPX projection.
 */
async function validateHiPSTile(outputPath, expectedTileNo) {
  const stat = await fs.stat(outputPath);

  assert.ok(stat.size > 0, `Expected non-empty FITS file: ${outputPath}`);

  /*
   * Re-read the generated file using jsfitsio.
   *
   * This validates the complete writer -> reader path,
   * not only the internal WCSLight FITS model.
   */
  const fitsFile = await FITSParser.loadFITSFile(outputPath);

  assert.ok(fitsFile, `Unable to read generated HiPS FITS file: ${outputPath}`);

  const image = fitsFile.primaryHDU;

  assert.ok(
    image,
    `Generated HiPS FITS file has no Primary HDU: ${outputPath}`,
  );

  /*
   * HiPS FITS tiles are 2D images.
   */
  assert.equal(image.naxis, 2);

  assert.equal(image.shape.length, 2);

  const width = image.shape[0];
  const height = image.shape[1];

  assert.ok(Number.isFinite(width) && width > 0, `Invalid NAXIS1=${width}`);

  assert.ok(Number.isFinite(height) && height > 0, `Invalid NAXIS2=${height}`);

  /*
   * HiPS tiles must be square.
   */
  assert.equal(width, height, `HiPS tile is not square: ${width} x ${height}`);

  /*
   * Validate the HPX WCS projection.
   */
  const ctype1 = String(image.header.findById("CTYPE1")?.value);

  const ctype2 = String(image.header.findById("CTYPE2")?.value);

  assert.ok(
    ctype1.includes("RA---HPX"),
    `Expected CTYPE1=RA---HPX, got ${ctype1}`,
  );

  assert.ok(
    ctype2.includes("DEC--HPX"),
    `Expected CTYPE2=DEC--HPX, got ${ctype2}`,
  );

  /*
   * HiPS-specific metadata.
   */
  const order = Number(image.header.findById("HIPS_ORD")?.value);

  assert.ok(
    Number.isInteger(order) && order >= 0,
    `Invalid HiPS ORDER=${order}`,
  );

  const npix = Number(image.header.findById("NPIX")?.value);

  assert.equal(
    npix,
    expectedTileNo,
    `Expected NPIX=${expectedTileNo}, got ${npix}`,
  );

  /*
   * Standard FITS image metadata.
   */
  assert.ok(
    [8, 16, 32, -32, -64].includes(image.bitpix),
    `Unsupported BITPIX=${image.bitpix}`,
  );

  assert.ok(image.rawData);

  const bytesPerElement = Math.abs(image.bitpix) / 8;

  assert.equal(image.rawData.byteLength, width * height * bytesPerElement);

  /*
   * The WCS center must be defined.
   */
  const crval1 = Number(image.header.findById("CRVAL1")?.value);

  const crval2 = Number(image.header.findById("CRVAL2")?.value);

  assert.ok(Number.isFinite(crval1), `Invalid CRVAL1=${crval1}`);

  assert.ok(Number.isFinite(crval2), `Invalid CRVAL2=${crval2}`);

  /*
   * Scaling information.
   *
   * BZERO/BSCALE are expected for the projection
   * fixtures generated for these tests.
   */
  const bzero = Number(image.header.findById("BZERO")?.value);

  const bscale = Number(image.header.findById("BSCALE")?.value);

  assert.ok(Number.isFinite(bzero), `Invalid BZERO=${bzero}`);

  assert.ok(Number.isFinite(bscale), `Invalid BSCALE=${bscale}`);

  /*
   * Validate that the tile actually contains pixels.
   */
  assert.ok(image.typedData);

  assert.equal(image.typedData.length, width * height);

  return image;
}

for (const { name, fixture, prefix } of projections) {
  test(
    `${name} -> HiPS produces valid FITS tiles`,
    {
      timeout: 30_000,
    },
    async () => {
      await fs.mkdir(OUTPUT_DIR, {
        recursive: true,
      });

      const fixturePath = path.join(FIXTURE_DIR, fixture);

      /*
       * Ensure that the source FITS fixture exists.
       */
      const fixtureStat = await fs.stat(fixturePath);

      assert.ok(fixtureStat.size > 0, `Missing FITS fixture: ${fixturePath}`);

      /*
       * Verify that WCSLight recognizes the input
       * projection before performing the conversion.
       */
      const inputProjection = await WCSLight.extractProjectionType(fixturePath);

      assert.ok(inputProjection, `Unable to detect projection for ${fixture}`);

      const center = new Point(
        CoordsType.ASTRO,
        NumberType.DEGREES,
        CENTER_RA,
        CENTER_DEC,
      );

      /*
       * Perform the actual FITS -> HiPS conversion.
       */
      const fitsList = await WCSLight.fitsCutoutToHiPS(
        center,
        RADIUS_DEG,
        PIXEL_SIZE_DEG,
        fixturePath,
      );

      assert.ok(fitsList, `${name} -> HiPS returned null`);

      const entries = Array.from(fitsList.getFITSList());

      assert.ok(entries.length > 0, `${name} -> HiPS generated no tiles`);

      /*
       * Each entry has:
       *
       * [tileNumber, HiPSFITS]
       */
      for (const [tileNo, hipsFits] of entries) {
        assert.ok(Number.isInteger(tileNo), `Invalid tile number: ${tileNo}`);

        assert.ok(hipsFits, `Missing HiPSFITS object for tile ${tileNo}`);

        /*
         * Validate the in-memory HiPSFITS object.
         */
        assert.equal(hipsFits.getTileno(), tileNo);

        const header = hipsFits.getHeader();

        assert.ok(header);

        const ctype1 = String(header.findById("CTYPE1")?.value);

        const ctype2 = String(header.findById("CTYPE2")?.value);

        assert.ok(
          ctype1.includes("RA---HPX"),
          `Expected in-memory CTYPE1=RA---HPX, got ${ctype1}`,
        );

        assert.ok(
          ctype2.includes("DEC--HPX"),
          `Expected in-memory CTYPE2=DEC--HPX, got ${ctype2}`,
        );

        const payload = hipsFits.getPayload();

        assert.ok(payload.length > 0, `Empty payload for HiPS tile ${tileNo}`);

        /*
         * fitsCutoutToHiPS() currently writes files
         * using:
         *
         *   ./hips_<tileNo>.fits
         *
         * Move the generated file to the test output
         * directory and keep it for manual inspection
         * with SAOImage DS9.
         */
        const generatedPath = path.resolve(`hips_${tileNo}.fits`);

        const outputPath = path.join(OUTPUT_DIR, `${prefix}-${tileNo}.fits`);

        const generatedStat = await fs.stat(generatedPath);

        assert.ok(
          generatedStat.size > 0,
          `Expected generated FITS file: ${generatedPath}`,
        );

        await fs.rm(outputPath, {
          force: true,
        });

        await fs.rename(generatedPath, outputPath);

        /*
         * Re-open the file with jsfitsio and validate
         * the serialized HiPS FITS product.
         */
        await validateHiPSTile(outputPath, tileNo);
      }
    },
  );
}
