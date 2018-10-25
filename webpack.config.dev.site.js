/* eslint-disable no-console */
const webpack = require('webpack');
const path = require('path');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { parseDir } = require('./tools/helps');

const demoPath = './site/docs/demoPage/';
const getHtmlWebpackPlugin = () => {
  const demoNameArr = [];
  parseDir(demoPath, demoNameArr);
  const htmlWebpackPlugin = demoNameArr
    .filter((name)=>{
      return name.slice(-3) === '.js';
    })
    .map((name) => {
      const demoName = name.slice(0,-3);
      return new HtmlWebpackPlugin({
        filename: 'demo/' + demoName + '.html',
        template: path.join(__dirname, demoPath + 'demo.html'),
        chunks: [demoName]
      });
    });
  return htmlWebpackPlugin;
};

const getDemoEntries = () => {
  const entries = {};
  const demoNameArr = [];
  parseDir(demoPath, demoNameArr);
  const arr = demoNameArr.filter((name)=>{
      return name.slice(-3) === '.js';
    }
  );
  for(let each of arr) {
    entries[each.slice(0,-3)] = [demoPath + each];
  }
  return entries;
};

module.exports = {
  mode: 'development',
  // more info:https://webpack.github.io/docs/build-performance.html#sourcemaps
  // and https://webpack.github.io/docs/configuration.html#devtool
  devtool: 'cheap-module-source-map',
  entry: Object.assign({},
    {
      site: [
        'webpack-dev-server/client?http://localhost:5000',
        'webpack/hot/only-dev-server',
        'react-hot-loader/patch',
        './site/index'
      ],
    },
    getDemoEntries()
  ),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CaseSensitivePathsPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'site/index.html'),
      chunks: ['site']
    })].concat(getHtmlWebpackPlugin()),
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader'
        }, {
          loader: 'less-loader'
        }]
      },
      {
        test: /\.(ttf|eot|svg|woff|woff2)(\?.+)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.(jpe?g|png|gif)(\?.+)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.md$/,
        loader: 'raw-loader'
      }
    ]
  }
};