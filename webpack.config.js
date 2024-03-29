import path from 'path';
import {fileURLToPath} from 'url';
import webpack from 'webpack'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PATHS = {
  entryPoint4Browser: path.resolve(__dirname, 'src/index.ts'),
  bundles: path.resolve(__dirname, '_bundles'),
}


var browserConfig = {
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

export default (env, argv) => {
  return [browserConfig];
};


