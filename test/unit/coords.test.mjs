import assert from "node:assert/strict";
import test from "node:test";

import { Point, CoordsType, NumberType } from "../../lib-esm/index.js";

test("Point converts astro coordinates to spherical coordinates", () => {
  const point = new Point(CoordsType.ASTRO, NumberType.DEGREES, 180, 0);

  assert.equal(point.getAstro().raDeg, 180);
  assert.equal(point.getAstro().decDeg, 0);
  assert.equal(point.getSpherical().phiDeg, 180);
  assert.equal(point.getSpherical().thetaDeg, 90);
});

test("Point wraps negative RA to positive range", () => {
  const point = new Point(CoordsType.ASTRO, NumberType.DEGREES, -10, 20);

  assert.equal(point.getAstro().raDeg, 350);
  assert.equal(point.getAstro().decDeg, 20);
});