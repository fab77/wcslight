import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const ENTRY = path.resolve(__dirname, 'src/index.ts');
const OUT   = path.resolve(__dirname, 'dist');

const common = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    extensionAlias: { '.js': ['.ts', '.js'], '.mjs': ['.mts', '.mjs'] },
  },
  module: {
    rules: [{ test: /\.(ts|tsx)$/i, use: 'ts-loader', exclude: /node_modules/ }],
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/^node:/, r => { r.request = r.request.replace(/^node:/, ''); }),
    new webpack.DefinePlugin({ __APP_VERSION__: JSON.stringify(pkg.version) }),
    new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }), // no extra chunks
  ],
  optimization: { splitChunks: false, runtimeChunk: false },
  devtool: 'source-map',
};

// UMD (browser) -> wcslight.js + wcslight.min.js
const browserConfig = {
  ...common,
  name: 'browser',
  target: 'web',
  entry: { wcslight: ENTRY, 'wcslight.min': ENTRY },
  output: {
    path: OUT,
    filename: '[name].js',
    library: 'wcslight',
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: 'this',
    // clean: false  // <- IMPORTANT: let your npm script do the cleaning
  },
  optimization: {
    ...common.optimization,
    minimize: true,
    minimizer: [new TerserPlugin({ include: /\.min\.js$/ })],
  },
};

// CJS (node) -> wcslight.cjs
const cjsConfig = {
  ...common,
  name: 'cjs',
  target: 'node',
  entry: ENTRY,
  output: {
    path: OUT,
    filename: 'wcslight.cjs',
    libraryTarget: 'commonjs2',
    // clean: false
  },
  optimization: { splitChunks: false, runtimeChunk: false, minimize: false },
};

const esmConfig = {
  ...common,
  name: 'esm',
  target: 'web',
  entry: ENTRY,
  experiments: { outputModule: true },
  output: {
    path: OUT,
    filename: 'wcslight.esm.js',
    library: { type: 'module' }, // real ESM
  },
  optimization: { splitChunks: false, runtimeChunk: false, minimize: false },
};

export default [browserConfig, cjsConfig, esmConfig];