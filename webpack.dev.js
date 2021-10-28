var path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack'); //to access built-in plugins

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        wcslight: './src/WCSLight.js',
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/dist',
        // library: 'wcslight',
        // libraryTarget: 'umd',
    },
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
    optimization: {
        runtimeChunk: true,
        usedExports: true
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new CleanWebpackPlugin()
    ],
    // resolve: {
    //     extensions: ['.js'],
    //     modules: [path.resolve(__dirname, 'src')],
    // },

};