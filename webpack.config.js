const webpack = require('webpack')
const path = require('path')

const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const VERSION = '0.0.1'

module.exports = {
    entry: './client/clientMain.js',
    node: {
        fs: 'empty'
    },
    output: {
        filename: 'app-v' + VERSION + '.js',
        libraryTarget: 'var',
        library: 'start',
        path: path.resolve(__dirname, './public/js')
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    },
    watchOptions: {
        ignored: /node_modules/,
    },
    plugins: [
        //new UglifyJSPlugin()
    ]
}
