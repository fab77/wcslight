import { HiPSHelper } from "../../lib-esm/projections/HiPSHelper.js";

const cases = [
  [0, 6],
  [0, 7],
  [1, 24],
  [2, 0],
  [2, 63],
  [2, 96],
  [2, 191],
];

for (const [order, tileno] of cases) {
  const hp = HiPSHelper.getHelpixByOrder(order);

  const corners = hp.getBoundaries(tileno);

  console.log(`\norder=${order} NPIX=${tileno}`);

  for (let i = 0; i < corners.length; i++) {
    const v = corners[i];

    const r = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

    const ra = ((Math.atan2(v.y, v.x) * 180) / Math.PI + 360) % 360;

    const dec = (Math.asin(v.z / r) * 180) / Math.PI;

    console.log(i, {
      ra,
      dec,
    });
  }
}
