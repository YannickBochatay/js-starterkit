"use strict";

var webpack = require('webpack');
var CleanPlugin = require('clean-webpack-plugin');
var ExtractPlugin = require('extract-text-webpack-plugin');
var BowerWebpackPlugin = require("bower-webpack-plugin");
var path = require("path");

var production = process.env.NODE_ENV === 'production';

var plugins = [

  new webpack.IgnorePlugin(/vertx/),

  new BowerWebpackPlugin(),

  new ExtractPlugin('bundle.css'), // <=== where should content be piped

  new webpack.optimize.CommonsChunkPlugin({
    name: 'main', // Move dependencies to our main file
    children: true, // Look for common dependencies in all children,
    minChunks: 2, // How many times a dependency must come up before being extracted
  })
];

if (production) {

  plugins = plugins.concat([

    // Cleanup the builds/ folder before
    // compiling our final assets
    new CleanPlugin('builds/*'),

    // This plugin looks for similar chunks and files
    // and merges them for better caching by the user
    new webpack.optimize.DedupePlugin(),

    // This plugins optimizes chunks and modules by
    // how much they are used in your app
    new webpack.optimize.OccurenceOrderPlugin(),

    // This plugin prevents Webpack from creating chunks
    // that would be too small to be worth loading separately
    new webpack.optimize.MinChunkSizePlugin({
      minChunkSize: 51200, // ~50kb
    }),

    // This plugin minifies all the Javascript code of the final bundle
    new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      compress: {
        warnings: false, // Suppress uglification warnings
      },
    }),
    // This plugins defines various variables that we can set to false
    // in production to avoid code related to them from being compiled
    // in our final bundle
    new webpack.DefinePlugin({
      __SERVER__: !production,
      __DEVELOPMENT__: !production,
      __DEVTOOLS__: !production,
      'process.env': {
        BABEL_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ]);
}

module.exports = {

  entry: ['./src'],

  output: {
    path: path.resolve(__dirname, "builds"),
    filename: 'bundle.js',
    publicPath: '/builds/'
  },

  debug: !production,

  devtool: production ? false : 'source-map',

  plugins: plugins,

  resolve : {

    extensions : ["", ".webpack.js", ".web.js", ".js", ".css", ".scss", ".less"]
  },

  module: {

    preLoaders: [{

        test: /\.jsx?$/,

        loaders: ['eslint'],

        include: __dirname + '/src'

      }],

    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel?babelrc=false,presets[]=react,presets[]=es2015'
      },
      {
        test: /\.css$/,
        loader: ExtractPlugin.extract('style', 'css?modules')
      },
      {
        test: /\.scss$/,
        loader: ExtractPlugin.extract('style', 'css?modules!sass')
      },
      {
        test: /\.less$/,
        loader: ExtractPlugin.extract('style', 'css?modules!less')
      },
      {
        test: /\.html$/,
        loader: 'html'
      },
      {
        test: /\.(png|gif|jpe?g)$/i,
        loader: 'url?limit=10000',
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=application/octet-stream'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=image/svg+xml'
      }
    ],
  }
};
