import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { FITSHeaderItem, FITSHeaderManager } from "jsfitsio";
import { Healpix, Pointing } from "astrospatial-core/healpix";

import { HiPSHelper } from "../../lib-esm/projections/HiPSHelper.js";
import { HiPSFITS } from "../../lib-esm/projections/hips/HiPSFITS.js";
import { FITSWriterAdapter } from "../../lib-esm/utils/FITSWriterAdapter.js";

const TILE_WIDTH = 512;

/*
 * wcsware prints world coordinates with about
 * 6 decimal digits in the default textual output.
 *
 * 1e-5 degree is therefore a reasonable tolerance.
 */
const WCS_TOLERANCE_DEG = 1e-5;

const HIPS_TILE_DEPTH = 9;

const cases = [
  {
    name: "order-0-face-6",
    order: 0,
    tileno: 6,
  },
  {
    name: "order-0-face-7",
    order: 0,
    tileno: 7,
  },
  {
    name: "order-1-face-6",
    order: 1,
    tileno: 24,
  },
  {
    name: "order-1-face-7",
    order: 1,
    tileno: 28,
  },
  {
    name: "order-2-north-polar",
    order: 2,
    tileno: 0,
  },
  {
    name: "order-2-wrap",
    order: 2,
    tileno: 63,
  },
  {
    name: "order-2-face-6",
    order: 2,
    tileno: 96,
  },
  {
    name: "order-2-face-7",
    order: 2,
    tileno: 112,
  },
  {
    name: "order-2-south-polar",
    order: 2,
    tileno: 191,
  },
];

const childPixelSamples = [
  {
    name: "centre",
    x: 256.5,
    y: 256.5,
  },
  {
    name: "upper-right",
    x: 448.5,
    y: 64.5,
  },
  {
    name: "lower-left",
    x: 64.5,
    y: 448.5,
  },
  {
    name: "right-interior",
    x: 384.5,
    y: 192.5,
  },
  {
    name: "left-interior",
    x: 192.5,
    y: 384.5,
  },
  {
    name: "lower-interior",
    x: 384.5,
    y: 384.5,
  },
  {
    name: "diagonal-interior",
    x: 384.5,
    y: 320.5,
  },
];

function hasWCSWare() {
  const result = spawnSync("which", ["wcsware"], {
    encoding: "utf8",
    timeout: 2000,
  });

  return result.status === 0;
}

function angularRADifferenceDeg(a, b) {
  let delta = a - b;

  while (delta > 180) {
    delta -= 360;
  }

  while (delta < -180) {
    delta += 360;
  }

  return Math.abs(delta);
}

function wcslibPix2World(filePath, x, y) {
  const result = spawnSync("wcsware", ["-x", filePath], {
    input: `${x} ${y}\n`,
    encoding: "utf8",
    timeout: 5000,
  });

  if (result.error) {
    throw result.error;
  }

  const output = [result.stdout ?? "", result.stderr ?? ""].join("\n");

  assert.equal(
    result.status,
    0,
    [
      "wcsware pixel-to-world conversion failed.",
      `pixel=(${x}, ${y})`,
      output,
    ].join("\n"),
  );

  const match = output.match(
    /World:\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?),\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?)/,
  );

  assert.ok(
    match,
    [
      "Unable to parse WCSLib world coordinates.",
      `pixel=(${x}, ${y})`,
      output,
    ].join("\n"),
  );

  return {
    ra: Number(match[1]),
    dec: Number(match[2]),
  };
}

function worldToNestedPixel(order, world) {
  const healpix = new Healpix(2 ** order);

  const phi = ((((world.ra % 360) + 360) % 360) * Math.PI) / 180;

  const theta = ((90 - world.dec) * Math.PI) / 180;

  return healpix.ang2pix(new Pointing(null, false, theta, phi));
}

function parentPixelAtOrder(childPixel, childOrder, parentOrder) {
  assert.ok(
    childOrder >= parentOrder,
    `childOrder=${childOrder} must be >= parentOrder=${parentOrder}`,
  );

  return Math.floor(childPixel / Math.pow(4, childOrder - parentOrder));
}

function validateWCSHeader(filePath) {
  const result = spawnSync("wcsware", ["-l", "-v", filePath], {
    encoding: "utf8",
    timeout: 5000,
  });

  if (result.error) {
    throw result.error;
  }

  const output = [result.stdout ?? "", result.stderr ?? ""].join("\n");

  assert.equal(result.status, 0, ["WCSLib lint failed.", output].join("\n"));

  assert.match(output, /No invalid WCS keyrecords were found\./);
}

function createHiPSHeader(order, tileno) {
  const hipsProperties = {
    getItem(key) {
      const k = String(key).toUpperCase();

      if (k.includes("ORDER")) {
        return order;
      }

      if (k.includes("TILE")) {
        return TILE_WIDTH;
      }

      return undefined;
    },
  };

  const hipsFits = new HiPSFITS(null, tileno, hipsProperties);

  hipsFits.header = new FITSHeaderManager();

  hipsFits.header.insert(
    new FITSHeaderItem(FITSHeaderManager.SIMPLE, true, ""),
  );

  hipsFits.header.insert(new FITSHeaderItem(FITSHeaderManager.BITPIX, 16, ""));

  hipsFits.header.insert(new FITSHeaderItem(FITSHeaderManager.NAXIS, 2, ""));

  hipsFits.header.insert(
    new FITSHeaderItem(FITSHeaderManager.NAXIS1, TILE_WIDTH, ""),
  );

  hipsFits.header.insert(
    new FITSHeaderItem(FITSHeaderManager.NAXIS2, TILE_WIDTH, ""),
  );

  hipsFits.addHPXWCS();

  hipsFits.header.insert(new FITSHeaderItem("END", "", ""));

  return hipsFits.header;
}

async function createTemporaryTile(order, tileno) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "wcslight-hpx-wcs-"));

  const filePath = path.join(tempDir, `Norder${order}-Npix${tileno}.fits`);

  const header = createHiPSHeader(order, tileno);

  const rows = new Array(TILE_WIDTH);

  for (let row = 0; row < TILE_WIDTH; row++) {
    rows[row] = new Uint8Array(TILE_WIDTH * 2);
  }

  FITSWriterAdapter.writeImage(header, rows, filePath);

  return {
    tempDir,
    filePath,
  };
}

function healpixPixelCenter(order, tileno) {
  const healpix = HiPSHelper.getHelpixByOrder(order);

  /*
   * Independent HEALPix reference.
   *
   * pix2ang() returns:
   *
   * theta = colatitude [0, pi]
   * phi   = longitude  [0, 2pi)
   */
  const pointing = healpix.pix2ang(tileno);

  const raDeg = (pointing.phi * 180) / Math.PI;

  const decDeg = 90 - (pointing.theta * 180) / Math.PI;

  return {
    ra: raDeg,
    dec: decDeg,
  };
}

for (const { name, order, tileno } of cases) {
  test(
    `WCSLib matches HEALPix tile centre: ${name}`,
    {
      skip: !hasWCSWare(),
      timeout: 30_000,
    },

    async () => {
      const { tempDir, filePath } = await createTemporaryTile(order, tileno);

      try {
        validateWCSHeader(filePath);

        /*
         * Geometric centre of a 512x512 FITS image.
         *
         * FITS coordinates are one-based, therefore
         * the centre lies at 256.5, 256.5.
         */
        const actual = wcslibPix2World(filePath, 256.5, 256.5);

        /*
         * Independent expected centre obtained directly
         * from the HEALPix NESTED implementation.
         */
        const expected = healpixPixelCenter(order, tileno);

        const raError = angularRADifferenceDeg(actual.ra, expected.ra);

        const decError = Math.abs(actual.dec - expected.dec);

        assert.ok(
          raError < WCS_TOLERANCE_DEG,
          [
            `${name}: RA mismatch`,
            `order=${order}`,
            `tileno=${tileno}`,
            `WCSLib=${actual.ra}`,
            `HEALPix=${expected.ra}`,
            `error=${raError} deg`,
          ].join("\n"),
        );

        assert.ok(
          decError < WCS_TOLERANCE_DEG,
          [
            `${name}: Dec mismatch`,
            `order=${order}`,
            `tileno=${tileno}`,
            `WCSLib=${actual.dec}`,
            `HEALPix=${expected.dec}`,
            `error=${decError} deg`,
          ].join("\n"),
        );

        console.log({
          name,
          order,
          tileno,
          wcslib: actual,
          healpix: expected,
          raError,
          decError,
        });
      } finally {
        await fs.rm(tempDir, {
          recursive: true,
          force: true,
        });
      }
    },
  );
}

for (const { name, order, tileno } of cases) {
  test(
    `WCSLib maps representative pixels inside HEALPix tile: ${name}`,
    {
      skip: !hasWCSWare(),
      timeout: 30_000,
    },

    async () => {
      const { tempDir, filePath } = await createTemporaryTile(order, tileno);

      try {
        validateWCSHeader(filePath);

        const childOrder = order + HIPS_TILE_DEPTH;

        for (const sample of childPixelSamples) {
          const world = wcslibPix2World(filePath, sample.x, sample.y);

          const childPixel = worldToNestedPixel(childOrder, world);

          const parentPixel = parentPixelAtOrder(
            childPixel,
            childOrder,
            order,
          );

          assert.equal(
            parentPixel,
            tileno,
            [
              `${name}/${sample.name}: WCSLib world coordinate is outside the expected HiPS parent tile.`,
              `order=${order}`,
              `tileno=${tileno}`,
              `childOrder=${childOrder}`,
              `childPixel=${childPixel}`,
              `parentPixel=${parentPixel}`,
              `world=(${world.ra}, ${world.dec})`,
              `fitsPixel=(${sample.x}, ${sample.y})`,
            ].join("\n"),
          );
        }
      } finally {
        await fs.rm(tempDir, {
          recursive: true,
          force: true,
        });
      }
    },
  );
}
