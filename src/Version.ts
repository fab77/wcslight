// // src/version.ts
// let ver = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : undefined;

// if (!ver && typeof process !== 'undefined' && process.versions?.node) {
//   // Node runtime: try reading package.json without breaking browser bundles
//   try {
//     // Delay import so bundlers can tree-shake this path out
//     // @ts-ignore
//     const { createRequire } = await import('node:module');
//     const req = createRequire(import.meta.url);
//     ver = req('../package.json').version as string;
//   } catch {
//     // ignore
//   }
// }

// export const APP_VERSION: string = ver ?? '0.0.0-dev';


declare const __APP_VERSION__: string;
export const APP_VERSION = __APP_VERSION__;