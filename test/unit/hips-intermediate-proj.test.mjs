import assert from "node:assert/strict";
import test from "node:test";

import { HiPSHelper } from "../../lib-esm/projections/HiPSHelper.js";
import { HiPSIntermediateProj } from "../../lib-esm/projections/hips/HiPSIntermediateProj.js";
import { fillAstro } from "../../lib-esm/model/Utils.js";
import { NumberType } from "../../lib-esm/model/NumberType.js";

const DEG_TOLERANCE = 1e-10;

function astro(raDeg, decDeg) {
  const value = fillAstro(raDeg, decDeg, NumberType.DEGREES);

  assert.ok(value, `Unable to create AstroCoords for ${raDeg}, ${decDeg}`);

  return value;
}

function angularDifferenceDeg(a, b) {
  let delta = a - b;

  while (delta > 180) {
    delta -= 360;
  }

  while (delta < -180) {
    delta += 360;
  }

  return Math.abs(delta);
}

test("HiPSIntermediateProj maps equatorial sky coordinates to HPX coordinates", () => {
  const [x, y] = HiPSIntermediateProj.world2intermediate(astro(123, 30));

  assert.ok(Math.abs(x - 123) < DEG_TOLERANCE);

  assert.ok(Math.abs(y - 33.75) < DEG_TOLERANCE);
});

test("HiPSIntermediateProj round-trips representative equatorial and polar coordinates", () => {
  const samples = [
    {
      name: "equatorial",
      ra: 123,
      dec: 30,
    },
    {
      name: "north-polar",
      ra: 45,
      dec: 80,
    },
    {
      name: "south-polar",
      ra: 135,
      dec: -80,
    },
    {
      name: "wrap",
      ra: 359,
      dec: 10,
    },
  ];

  for (const sample of samples) {
    const [x, y] = HiPSIntermediateProj.world2intermediate(
      astro(sample.ra, sample.dec),
    );

    const roundTrip = HiPSIntermediateProj.intermediate2world(
      x,
      y,
    ).getAstro();

    assert.ok(
      angularDifferenceDeg(roundTrip.raDeg, sample.ra) < DEG_TOLERANCE,
      `${sample.name}: RA mismatch ${roundTrip.raDeg} != ${sample.ra}`,
    );

    assert.ok(
      Math.abs(roundTrip.decDeg - sample.dec) < DEG_TOLERANCE,
      `${sample.name}: Dec mismatch ${roundTrip.decDeg} != ${sample.dec}`,
    );
  }
});

test("HiPSIntermediateProj preserves tile 6 order-0 envelope", () => {
  const healpix = HiPSHelper.getHelpixByOrder(0);

  const grid = HiPSIntermediateProj.setupByTile(6, healpix);

  assert.ok(Math.abs(grid.min_x - 135) < DEG_TOLERANCE);

  assert.ok(Math.abs(grid.max_x - 225) < DEG_TOLERANCE);

  assert.ok(Math.abs(grid.min_y + 45) < DEG_TOLERANCE);

  assert.ok(Math.abs(grid.max_y - 45) < DEG_TOLERANCE);
});

test("HiPSIntermediateProj maps representative tile pixels inside the local intermediate grid", () => {
  const healpix = HiPSHelper.getHelpixByOrder(2);

  const cases = [
    {
      name: "north-polar",
      tileno: 0,
    },
    {
      name: "wrap",
      tileno: 63,
    },
    {
      name: "equatorial-face-6",
      tileno: 96,
    },
    {
      name: "south-polar",
      tileno: 191,
    },
  ];

  const samples = [
    [64, 64],
    [128, 384],
    [255, 255],
    [384, 128],
    [448, 448],
  ];

  for (const tile of cases) {
    const grid = HiPSIntermediateProj.setupByTile(tile.tileno, healpix);

    for (const [i, j] of samples) {
      const [x, y] = HiPSIntermediateProj.pix2intermediate(
        i,
        j,
        grid,
        512,
        512,
      );

      assert.ok(
        x >= grid.min_x - DEG_TOLERANCE,
        `${tile.name}: x=${x} is below min_x=${grid.min_x}`,
      );

      assert.ok(
        x <= grid.max_x + DEG_TOLERANCE,
        `${tile.name}: x=${x} is above max_x=${grid.max_x}`,
      );

      assert.ok(
        y >= grid.min_y - DEG_TOLERANCE,
        `${tile.name}: y=${y} is below min_y=${grid.min_y}`,
      );

      assert.ok(
        y <= grid.max_y + DEG_TOLERANCE,
        `${tile.name}: y=${y} is above max_y=${grid.max_y}`,
      );
    }
  }
});

test("HiPSIntermediateProj maps tile centre back to the centre pixel", () => {
  const healpix = HiPSHelper.getHelpixByOrder(2);

  const cases = [
    {
      name: "north-polar",
      tileno: 0,
    },
    {
      name: "wrap",
      tileno: 63,
    },
    {
      name: "equatorial-face-6",
      tileno: 96,
    },
    {
      name: "south-polar",
      tileno: 191,
    },
  ];

  for (const tile of cases) {
    const grid = HiPSIntermediateProj.setupByTile(tile.tileno, healpix);

    const [x, y] = HiPSIntermediateProj.pix2intermediate(
      255,
      255,
      grid,
      512,
      512,
    );

    const [i, j] = HiPSIntermediateProj.intermediate2pix(x, y, grid, 512);

    assert.ok(
      Math.abs(i - 256) <= 1,
      `${tile.name}: centre i=${i} is not near the centre`,
    );

    assert.ok(
      Math.abs(j - 256) <= 1,
      `${tile.name}: centre j=${j} is not near the centre`,
    );
  }
});
