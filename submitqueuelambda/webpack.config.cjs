const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
//const CopyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/lambda-index.js',
  target: 'node',
  mode: 'production',
  optimization: {
    // We no not want to minimize our code.
    minimize: false
  },
  node: {
    __dirname: true,
  },
  performance: {
    // Turn off size warnings for entry points
    hints: false
  },
  resolve: {
    extensions: [
      '.js',
      '.json',
    ],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
      },
    ],
  }
}