const merge = require('webpack-merge');

const webpackBaseConfig = require('./webpack.config.base').config;

const configureDevTool = () => '#cheap-module-eval-source-map';

const devConfig = merge(webpackBaseConfig, {
  mode: 'development',
  devServer: {
    contentBase: '../src',
    watchContentBase: true,
    compress: true,
    port: 9000,
    hot: true
  },
  watch: true,
  devtool: configureDevTool(),
  optimization: {
    minimize: false,
  },
});

module.exports = devConfig;
