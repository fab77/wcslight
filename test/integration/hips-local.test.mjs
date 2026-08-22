import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";

import { FITSParser } from "jsfitsio";

import {
  WCSLight,
  Point,
  CoordsType,
  NumberType,
  MercatorProjection,
} from "../../lib-esm/index.js";

import { startHiPSFixtureServer } from "../helpers/hips-fixture-server.mjs";

const OUTPUT_FILE = "test/output/hips-local-mercator.fits";

test(
  "local HiPS cutout produces a FITS result",
  { timeout: 30_000 },
  async () => {
    const server = await startHiPSFixtureServer();

    try {
      await fs.mkdir("test/output", {
        recursive: true,
      });

      await fs.rm(OUTPUT_FILE, {
        force: true,
      });

      const center = new Point(
        CoordsType.ASTRO,
        NumberType.DEGREES,
        160.752615,
        -64.4051202,
      );

      const radiusDeg = 0.05;
      const pixelSizeDeg = 0.005;

      const outProjection = new MercatorProjection();

      const result = await WCSLight.hipsCutoutToFITS(
        center,
        radiusDeg,
        pixelSizeDeg,
        server.url,
        outProjection,
        null,
        OUTPUT_FILE,
      );

      assert.ok(result);

      assert.ok(result.fits);

      assert.ok(result.fitsused.length > 0);

      assert.ok(result.pxsize > 0);

      /*
       * Verify that wcslight actually produced
       * the requested output FITS file.
       */
      const stat = await fs.stat(OUTPUT_FILE);

      assert.ok(stat.size > 0);

      /*
       * Re-read the generated output using jsfitsio.
       *
       * This validates the full write/read cycle.
       */
      const fitsFile = await FITSParser.loadFITSFile(OUTPUT_FILE);

      assert.ok(fitsFile);

      const image = fitsFile.primaryHDU;

      assert.ok(image);

      assert.equal(image.naxis, 2);

      assert.deepEqual(image.shape, [20, 20]);

      assert.equal(image.bitpix, 16);

      assert.ok(image.rawData);

      assert.equal(image.rawData.byteLength, 20 * 20 * 2);

      /*
       * This test explicitly requests
       * a Mercator output projection.
       */
      const ctype1 = String(image.header.findById("CTYPE1")?.value);

      const ctype2 = String(image.header.findById("CTYPE2")?.value);

      assert.ok(ctype1.includes("RA---MER"));

      assert.ok(ctype2.includes("DEC--MER"));

      const blank = Number(image.header.findById("BLANK")?.value);

      const bzero = Number(image.header.findById("BZERO")?.value);

      const bscale = Number(image.header.findById("BSCALE")?.value);

      assert.equal(blank, -32768);

      assert.equal(bzero, 50);

      assert.ok(Number.isFinite(bscale));

      const datamin = Number(image.header.findById("DATAMIN")?.value);

      const datamax = Number(image.header.findById("DATAMAX")?.value);

      assert.ok(Number.isFinite(datamin));

      assert.ok(Number.isFinite(datamax));

      assert.ok(datamin <= datamax);
    } finally {
      await fs.rm(OUTPUT_FILE, {
        force: true,
      });

      await server.close();
    }
  },
);
