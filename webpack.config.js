'use strict';

const webpack = require('webpack');

module.exports = {
  output: {
    library: 'StravaEnhancer',
    libraryTarget: 'window'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel?stage=0&loose=all'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'PLUGIN_NAME': JSON.stringify('StravaEnhancer'),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ]
};
