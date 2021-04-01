const path = require('path')
const baseConfig = require('./webpack.config.base')
const { merge } = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'

const devServer = {
  contentBase: '../dist',
  port: '8080',
  host: '0.0.0.0',
  overlay: {
    errors: true
  },
  hot: true,
  stats: 'errors-only'
}

let config

if (isDev) {
  config = merge(baseConfig, {
    devtool: 'eval-cheap-module-source-map',
    module: {
      rules: [
        {
          test: /\.styl(us)?$/,
          use: [
            'vue-style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true
              }
            },
            'stylus-loader'
          ]
        },
      ]
    },
    devServer,
    plugins: [],
  })
} else {
  config = merge(baseConfig, {
    entry: {
      app: path.resolve(__dirname, '../src/index.js'),
    },
    output: {
      filename: '[name]_[contenthash:8].bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.styl(us)?$/,
          use: [
            'vue-style-loader',
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true
              }
            },
            'stylus-loader'
          ]
        },
      ]
    },
    optimization: {
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      minimize: true,
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'style',
            type: 'css/mini-extract',
            chunks: 'all',
            enforce: true
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      },
      minimizer: [
        new CssMinimizerPlugin({
          test: /\.styl(us)?$/,
          parallel: true,
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true}
              }
            ]
          }
        })
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name]_[contenthash:8].css',
        chunkFilename: '[id]_[contenthash:8].css',
        ignoreOrder: true
      })
    ]
  })
}

module.exports = config
