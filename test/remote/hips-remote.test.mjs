import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";

import {
  WCSLight,
  Point,
  CoordsType,
  NumberType,
  MercatorProjection,
} from "../../lib-esm/index.js";

const OUTPUT_FILE = "cartesian2.fits";

test(
  "remote HiPS cutout produces a FITS result",
  { timeout: 120_000 },
  async () => {
    await fs.rm(OUTPUT_FILE, { force: true });

    const hipsUrl = "https://alasky.cds.unistra.fr/DECaPS/DR1/g/";
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
      hipsUrl,
      outProjection,
    );

    assert.ok(result);
    assert.ok(result.fits);
    assert.ok(result.fitsused.length > 0);
    assert.ok(result.pxsize > 0);
    
    const stat = await fs.stat(OUTPUT_FILE);
    assert.ok(stat.size > 0);

    await fs.rm(OUTPUT_FILE, { force: true });
  },
);
