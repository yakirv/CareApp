const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { watchFile } = require('fs')
const webpack = require('webpack')
const Dotenv = require('dotenv-webpack')

module.exports = {
    entry: './src/index.js',

    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        // publicPath: '/CareApp/',
        clean: true,
    },

    devtool: 'eval-source-map',
    devServer: {
        watchFiles: ['./src/template.html'],
    },
    stats: {
        children: true,
    },

    mode: 'development',

    plugins: [
        new HtmlWebpackPlugin({
            template: './src/template.html',
            //    filename: 'template.html',
        }),
        new Dotenv(),
    ],

    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.html$/i,
                use: 'html-loader',
            },
            {
                test: /\.(png|jpg|jpeg)$/i,
                type: 'asset/resource',
            },
        ],
    },
}
