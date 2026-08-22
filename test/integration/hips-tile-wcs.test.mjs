import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { FITSParser } from "jsfitsio";

import {
  WCSLight,
  Point,
  CoordsType,
  NumberType,
} from "../../lib-esm/index.js";

import { HiPSHelper } from "../../lib-esm/projections/HiPSHelper.js";

import { HiPSIntermediateProj } from "../../lib-esm/projections/hips/HiPSIntermediateProj.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURE = path.resolve(
  __dirname,
  "../fixtures/projections/cartesian.fits",
);

const OUTPUT_DIR = path.resolve(__dirname, "../output/conversions");

const TILE_WIDTH = 512;

const CENTER_RA = 180;
const CENTER_DEC = 0;

const RADIUS_DEG = 0.1;
const PIXEL_SIZE_DEG = 0.1;

/*
 * With the current fixture/cutout this produces
 *
 * order  = 0
 * tileno = 6
 */
const EXPECTED_ORDER = 0;
const EXPECTED_TILENO = 6;

const GENERATED_FILE = `hips_${EXPECTED_TILENO}.fits`;

const OUTPUT_FILE = path.join(
  OUTPUT_DIR,
  `wcs-test-hips-${EXPECTED_TILENO}.fits`,
);

const EPS_INTERMEDIATE = 1e-9;
const EPS_PIXEL = 1e-9;

function numberHeader(header, key) {
  const value = Number(header.findById(key)?.value);

  assert.ok(Number.isFinite(value), `Expected finite ${key}, got ${value}`);

  return value;
}

/*
 * Convert a FITS pixel position into the linear HPX intermediate
 * plane described by CRPIX + CD.
 *
 * FITS coordinates are 1-based.
 */
function fitsPixelToIntermediate(header, xFits, yFits) {
  const crpix1 = numberHeader(header, "CRPIX1");
  const crpix2 = numberHeader(header, "CRPIX2");

  const crval1 = numberHeader(header, "CRVAL1");
  const crval2 = numberHeader(header, "CRVAL2");

  const cd11 = numberHeader(header, "CD1_1");
  const cd12 = numberHeader(header, "CD1_2");
  const cd21 = numberHeader(header, "CD2_1");
  const cd22 = numberHeader(header, "CD2_2");

  const dx = xFits - crpix1;
  const dy = yFits - crpix2;

  const x = crval1 + cd11 * dx + cd12 * dy;

  const y = crval2 + cd21 * dx + cd22 * dy;

  return [x, y];
}

function intermediateToFitsPixel(header, x, y) {
  const crpix1 = numberHeader(header, "CRPIX1");
  const crpix2 = numberHeader(header, "CRPIX2");

  const crval1 = numberHeader(header, "CRVAL1");
  const crval2 = numberHeader(header, "CRVAL2");

  const cd11 = numberHeader(header, "CD1_1");
  const cd12 = numberHeader(header, "CD1_2");
  const cd21 = numberHeader(header, "CD2_1");
  const cd22 = numberHeader(header, "CD2_2");

  const determinant = cd11 * cd22 - cd12 * cd21;

  assert.notEqual(determinant, 0, "CD matrix must be invertible");

  const dx = x - crval1;
  const dy = y - crval2;

  const pixelDx = (cd22 * dx - cd12 * dy) / determinant;
  const pixelDy = (-cd21 * dx + cd11 * dy) / determinant;

  return [crpix1 + pixelDx, crpix2 + pixelDy];
}

test(
  "generated HiPS tile WCS matches HiPSIntermediateProj geometry",
  {
    timeout: 30_000,
  },
  async () => {
    await fs.mkdir(OUTPUT_DIR, {
      recursive: true,
    });

    await fs.rm(OUTPUT_FILE, {
      force: true,
    });

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "wcslight-hips-"));

    const previousCwd = process.cwd();

    const center = new Point(
      CoordsType.ASTRO,
      NumberType.DEGREES,
      CENTER_RA,
      CENTER_DEC,
    );

    try {
      process.chdir(tempDir);

      /*
       * Generate a HiPS tile from the Cartesian projection fixture.
       */
      const result = await WCSLight.fitsCutoutToHiPS(
        center,
        RADIUS_DEG,
        PIXEL_SIZE_DEG,
        FIXTURE,
      );

      assert.ok(result, "fitsCutoutToHiPS returned null");

      const generatedPath = path.join(tempDir, GENERATED_FILE);

      const generatedStat = await fs.stat(generatedPath);

      assert.ok(
        generatedStat.size > 0,
        `Generated HiPS file is empty: ${generatedPath}`,
      );

      /*
       * Preserve a copy for DS9/manual inspection.
       */
      await fs.rename(generatedPath, OUTPUT_FILE);
    } finally {
      process.chdir(previousCwd);

      await fs.rm(tempDir, {
        recursive: true,
        force: true,
      });
    }

    const fitsFile = await FITSParser.loadFITSFile(OUTPUT_FILE);

    assert.ok(fitsFile);

    const hdu = fitsFile.primaryHDU;

    assert.ok(hdu);

    const header = hdu.header;

    /*
     * ------------------------------------------------------------
     * Basic tile metadata
     * ------------------------------------------------------------
     */

    assert.equal(hdu.naxis, 2);

    assert.deepEqual(hdu.shape, [TILE_WIDTH, TILE_WIDTH]);

    assert.equal(numberHeader(header, "HIPS_ORD"), EXPECTED_ORDER);

    assert.equal(numberHeader(header, "NPIX"), EXPECTED_TILENO);

    assert.ok(String(header.findById("CTYPE1")?.value).includes("RA---HPX"));

    assert.ok(String(header.findById("CTYPE2")?.value).includes("DEC--HPX"));

    assert.equal(numberHeader(header, "PV2_1"), 4);

    assert.equal(numberHeader(header, "PV2_2"), 3);

    /*
     * ------------------------------------------------------------
     * Standard HPX celestial reference
     * ------------------------------------------------------------
     *
     * A HiPS tile is a cutout of the global HPX projection.
     *
     * Therefore CRVAL remains fixed at the global HPX
     * projection reference point. The location of the
     * individual tile is encoded by CRPIX and the CD matrix.
     */

    assert.equal(numberHeader(header, "CRVAL1"), 0);

    assert.equal(numberHeader(header, "CRVAL2"), 0);

    /*
     * CRPIX is allowed to lie outside the local 512x512 image.
     *
     * For this particular order-0 / NPIX-6 tile the selected
     * local HPX branch preserves +180 degrees, giving:
     */
    assert.equal(numberHeader(header, "CRPIX1"), 1280.5);

    assert.equal(numberHeader(header, "CRPIX2"), 1280.5);

    /*
     * Internal HEALPix geometry used by WCSLight.
     *
     * Use the preserved HiPSIntermediateProj logic only for
     * the tile centre and envelope. Full pixel-level sky
     * validation belongs to hips-tile-wcslib.test.mjs, because
     * WCSLib may choose a different valid HPX branch near a
     * longitude discontinuity.
     */
    const hp = HiPSHelper.getHelpixByOrder(EXPECTED_ORDER);

    const grid = HiPSIntermediateProj.setupByTile(EXPECTED_TILENO, hp);

    const [internalCenterX, internalCenterY] =
      HiPSIntermediateProj.pix2intermediate(
        255.5,
        255.5,
        grid,
        TILE_WIDTH,
        TILE_WIDTH,
      );

    const internalCenterWorld = HiPSIntermediateProj.intermediate2world(
      internalCenterX,
      internalCenterY,
    );

    const internalCenterAstro = internalCenterWorld.getAstro();

    /*
     * ------------------------------------------------------------
     * CD matrix scale
     * ------------------------------------------------------------
     */

    const expectedScale = 45 / (TILE_WIDTH * Math.pow(2, EXPECTED_ORDER));

    assert.equal(expectedScale, 0.087890625);

    assert.ok(
      Math.abs(Math.abs(numberHeader(header, "CD1_1")) - expectedScale) < 1e-12,
    );

    assert.ok(
      Math.abs(Math.abs(numberHeader(header, "CD1_2")) - expectedScale) < 1e-12,
    );

    assert.ok(
      Math.abs(Math.abs(numberHeader(header, "CD2_1")) - expectedScale) < 1e-12,
    );

    assert.ok(
      Math.abs(Math.abs(numberHeader(header, "CD2_2")) - expectedScale) < 1e-12,
    );

    /*
     * ------------------------------------------------------------
     * Linear WCS validation
     * ------------------------------------------------------------
     *
     * This test intentionally does not compare every pixel's
     * intermediate coordinate against HiPSIntermediateProj.
     * Around HPX branch cuts, both branches can describe the
     * same sky position but with incompatible intermediate X
     * coordinates.
     *
     * JavaScript raster coordinate:
     *
     *     i = 0
     *
     * corresponds to FITS pixel centre:
     *
     *     X = 1
     *
     * Therefore:
     *
     *     FITS = JS + 1
     */

    const samples = [
      {
        name: "centre",
        i: 255.5,
        j: 255.5,
      },
      {
        name: "corner-00",
        i: 0,
        j: 0,
      },
      {
        name: "corner-10",
        i: 511,
        j: 0,
      },
      {
        name: "corner-01",
        i: 0,
        j: 511,
      },
      {
        name: "corner-11",
        i: 511,
        j: 511,
      },

      /*
       * Additional interior samples make the
       * test harder to satisfy accidentally.
       */
      {
        name: "quarter-1",
        i: 128,
        j: 128,
      },
      {
        name: "quarter-2",
        i: 384,
        j: 128,
      },
      {
        name: "quarter-3",
        i: 128,
        j: 384,
      },
      {
        name: "quarter-4",
        i: 384,
        j: 384,
      },
    ];

    for (const { name, i, j } of samples) {
      const xFits = i + 1;

      const yFits = j + 1;

      const [actualX, actualY] = fitsPixelToIntermediate(header, xFits, yFits);

      assert.ok(Number.isFinite(actualX), `${name}: HPX X is not finite`);

      assert.ok(Number.isFinite(actualY), `${name}: HPX Y is not finite`);

      const [roundTripX, roundTripY] = intermediateToFitsPixel(
        header,
        actualX,
        actualY,
      );

      assert.ok(
        Math.abs(roundTripX - xFits) < EPS_PIXEL,
        `${name}: FITS X round-trip mismatch: ${roundTripX} != ${xFits}`,
      );

      assert.ok(
        Math.abs(roundTripY - yFits) < EPS_PIXEL,
        `${name}: FITS Y round-trip mismatch: ${roundTripY} != ${yFits}`,
      );
    }

    const [actualCenterX, actualCenterY] = fitsPixelToIntermediate(
      header,
      256.5,
      256.5,
    );

    assert.ok(
      Math.abs(actualCenterX - internalCenterX) < EPS_INTERMEDIATE,
      `centre: HPX X mismatch: FITS=${actualCenterX}, internal=${internalCenterX}`,
    );

    assert.ok(
      Math.abs(actualCenterY - internalCenterY) < EPS_INTERMEDIATE,
      `centre: HPX Y mismatch: FITS=${actualCenterY}, internal=${internalCenterY}`,
    );

    /*
     * Explicit sanity checks for tile 6 / order 0.
     *
     * These are useful because otherwise the same bug
     * introduced simultaneously into the header builder
     * and HiPSIntermediateProj could theoretically make
     * the relative comparison pass.
     */

    assert.ok(Math.abs(internalCenterAstro.raDeg - 180) < EPS_INTERMEDIATE);

    assert.ok(Math.abs(internalCenterAstro.decDeg) < EPS_INTERMEDIATE);

    assert.ok(
      Math.abs(grid.min_x - 135) < 1e-10,
      `Unexpected min_x=${grid.min_x}`,
    );

    assert.ok(
      Math.abs(grid.max_x - 225) < 1e-10,
      `Unexpected max_x=${grid.max_x}`,
    );

    assert.ok(
      Math.abs(grid.min_y + 45) < 1e-10,
      `Unexpected min_y=${grid.min_y}`,
    );

    assert.ok(
      Math.abs(grid.max_y - 45) < 1e-10,
      `Unexpected max_y=${grid.max_y}`,
    );

    console.log(`Validated HiPS WCS: ${OUTPUT_FILE}`);
  },
);
