const path = require('path');
const WebpackBar = require('webpackbar');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const resolve = (file) => path.resolve(__dirname, '../', file);

const configureResolve = () => ({
  extensions: ['.js', '.json'],
  modules: [resolve('node_modules')]
});

const configureBabelLoader = () => ({
  test: /\.(jsx?)$/,
  loader: 'babel-loader',
  exclude: /node_modules/,
});

const configureOutput = () => {
  return {
    path: resolve('dist'),
    filename: '[name].js',
    chunkFilename: '[name].js',
  };
};

const baseConfig = {
  entry: {
    index: resolve('src/index'),
  },
  output: configureOutput(),
  resolve: configureResolve(),
  watchOptions: {
    ignored: ['node_modules'],
  },
  module: {
    rules: [configureBabelLoader()],
  },
  plugins: [
    new WebpackBar({
      name: 'HGS',
      profile: false,
    }),
    new CopyWebpackPlugin([
      {
        from: 'src/assets',
        to: 'assets',
      },
    ]),
    new HTMLWebpackPlugin({
      template: 'src/index.html',
      filename: 'index.html',
      hash: true,
      minify: false,
    }),
  ]
};

module.exports.config = baseConfig;
