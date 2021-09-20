var path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

const CopyPlugin = require("copy-webpack-plugin");


module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
    },
    entry: {
        app: './src/index.js',

    },
    entry: './src/FITSOnTheWeb.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        library: 'wcslight',
    },
    optimization: {
        runtimeChunk: true,
        usedExports: true
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'wcslight',
            template: 'src/index.html'
        }),
        new MiniCssExtractPlugin(),
    ],
    externals: {
        jquery: "jQuery"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
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

};