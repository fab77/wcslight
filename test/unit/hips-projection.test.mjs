import assert from "node:assert/strict";
import test from "node:test";

import {
  Point,
  CoordsType,
  NumberType,
  HiPSProjection
} from "../../lib-esm/index.js";

test("HiPSProjection identifies candidate HiPS tiles around a sky position", () => {
  const center = new Point(CoordsType.ASTRO, NumberType.DEGREES, 180, 0);
  const result = HiPSProjection.getImageRADecList(center, 1, 1, 8);

  assert.ok(result);

  const tiles = result.getTilesList();
  assert.ok(tiles.length > 0);

  for (const tile of tiles) {
    assert.equal(Number.isInteger(tile), true);
    assert.ok(tile >= 0);
  }
});