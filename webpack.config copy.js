import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack'

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PATHS = {
  entryPoint4Browser: path.resolve(__dirname, 'src/index.ts'),
  bundles: path.resolve(__dirname, 'dist'),
}


const browserConfig = {
  entry: {
    'wcslight': [PATHS.entryPoint4Browser],
    'wcslight.min': [PATHS.entryPoint4Browser]
  },
  target: 'web',
  externals: {},
  output: {
    path: PATHS.bundles,
    libraryTarget: 'umd',
    library: 'wcslight',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    extensionAlias: {
      '.js': ['.ts', '.js'],
      '.mjs': ['.mts', '.mjs']
    }
  },
  devtool: 'source-map',
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /^node:/,
      (resource) => {
        resource.request = resource.request.replace(/^node:/, '');
      },
    ),
    new webpack.DefinePlugin({
      __APP_VERSION__: JSON.stringify(pkg.version),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        use: 'ts-loader',
        exclude: ["/node_modules/"],
      },
    ],
  }
}

const cjsConfig = {
  entry: PATHS.entryPoint4Browser,
  target: 'node',
  output: {
    path: PATHS.bundles,
    filename: 'wcslight.cjs',
    libraryTarget: 'commonjs2',
  },
  resolve: browserConfig.resolve,
  devtool: 'source-map',
  plugins: browserConfig.plugins,
  module: browserConfig.module,
  optimization: { splitChunks: false, runtimeChunk: false, minimize: false },
  output: {
    path: PATHS.bundles,
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'wcslight',
    umdNamedDefine: true
  },
};

export default (env, argv) => {
  return [browserConfig, cjsConfig];
};


