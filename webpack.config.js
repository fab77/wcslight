var path = require('path');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');


module.exports = {
    mode: 'development',
    devtool: 'source-map',

    entry: './src/WCSLight.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'WCSLight.js',
        library: 'wcslight',
        libraryTarget: 'umd',
    },
    optimization: {
        runtimeChunk: true,
        usedExports: true
    },
    plugins: [
        new CleanWebpackPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        "plugins": ["@babel/plugin-proposal-private-methods", "@babel/plugin-proposal-class-properties"]
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js'],
        modules: [path.resolve(__dirname, 'src')],
    },

};