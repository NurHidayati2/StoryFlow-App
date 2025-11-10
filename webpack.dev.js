// webpack.dev.js
const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  devServer: {
    host: 'localhost',
    port: 9000,
    client: {
      webSocketURL: {
        pathname: '/ws',
      },
    },
    hot: true, // Aktifkan hot module replacement jika diperlukan
    open: true,
 },
});
