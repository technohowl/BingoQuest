const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const args = require('yargs').argv

const env = args.env

module.exports = {
  entry: './src/app.ts',
  devtool:  (env === 'build') ? false : 'inline-source-map',
  mode: (env === 'build') ? 'production' :'development',
  devServer: {
    contentBase: './build',
    hot: true,
    port: 8080
  },
  plugins: [
    new CleanWebpackPlugin(['build']),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html'
    }),
    new CopyWebpackPlugin([
      { from: './src/assets', to: 'assets' },
      { from: './fbapp-config.json', to: './fbapp-config.json' },
      { from: './config.json', to: './config.json' },
      { from: './locale.json', to: './locale.json' },
    ]),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ].concat( (env !== 'build') ? [] :
    [
      new UglifyJSPlugin({
        uglifyOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  ),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'awesome-typescript-loader'
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: 'file-loader'
      }
    ]
  },
  resolve: {
    plugins: [
      new TsconfigPathsPlugin({
        /*configFile: "./path/to/tsconfig.json" */
      })
    ],
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'build')
  }
};
