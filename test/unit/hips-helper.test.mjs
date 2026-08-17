import assert from "node:assert/strict";
import test from "node:test";

import { HiPSHelper } from "../../lib-esm/index.js";

test("HiPSHelper computes pixel size and order consistently", () => {
  const px = HiPSHelper.computePxAngularSize(512, 3);
  const order = HiPSHelper.computeOrder(px.deg, 512);

  assert.equal(order, 3);
  assert.ok(Number.isFinite(px.rad));
  assert.ok(Number.isFinite(px.deg));
  assert.ok(px.deg > 0);
});

test("HiPSHelper creates Healpix instance by order", () => {
  const healpix = HiPSHelper.getHelpixByOrder(3);

  assert.equal(healpix.nside, 8);
  assert.equal(healpix.order, 3);
  assert.equal(healpix.getNPix(), 768);
});