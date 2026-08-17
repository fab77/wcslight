import assert from "node:assert/strict";
import test from "node:test";

import {
  WCSLight,
  Point,
  CoordsType,
  NumberType,
  HiPSHelper,
  HiPSProjection,
  MercatorProjection
} from "../../lib-esm/index.js";

test("public exports are available", () => {
  assert.equal(typeof WCSLight, "function");
  assert.equal(typeof Point, "function");
  assert.equal(typeof HiPSHelper, "function");
  assert.equal(typeof HiPSProjection, "function");
  assert.equal(typeof MercatorProjection, "function");
  assert.equal(typeof CoordsType, "object");
  assert.equal(typeof NumberType, "object");
});