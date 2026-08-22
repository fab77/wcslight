import { FITSHeaderManager } from "jsfitsio";
import { HiPSFITS } from "../../lib-esm/projections/hips/HiPSFITS.js";

const cases = [
  [0, 6],
  [0, 7],
  [1, 24],
  [1, 28],
  [2, 0],
  [2, 63],
  [2, 96],
  [2, 112],
  [2, 191],
];

function value(header, key) {
  return header.findById(key)?.value;
}

for (const [order, tileno] of cases) {
  const props = {
    getItem(key) {
      const k = String(key).toUpperCase();

      if (k.includes("ORDER")) return order;
      if (k.includes("TILE")) return 512;

      return undefined;
    },
  };

  const tile = new HiPSFITS(null, tileno, props);

  tile.header = new FITSHeaderManager();
  tile.addHPXWCS();

  const h = tile.header;

  console.log({
    order,
    tileno,
    CRPIX1: value(h, "CRPIX1"),
    CRPIX2: value(h, "CRPIX2"),
    CRVAL1: value(h, "CRVAL1"),
    CRVAL2: value(h, "CRVAL2"),
    CD1_1: value(h, "CD1_1"),
    CD1_2: value(h, "CD1_2"),
    CD2_1: value(h, "CD2_1"),
    CD2_2: value(h, "CD2_2"),
  });
}
