const merge = require('webpack-merge');
const webpackBaseConfig = require('./webpack.config.base').config;

const prodConfig = merge(webpackBaseConfig, {
  mode: 'production',
  devtool: '#source-map',
});

module.exports = prodConfig;
