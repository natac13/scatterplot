import webpack from 'webpack';
import path from 'path';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const BUILD_PATH = path.resolve(__dirname, 'build');
const ENTRY_PATH = path.resolve('./app', 'index.js');

const extractSass = new ExtractTextPlugin({
  // filename: '[name].[contenthash:base64:5].css',
  filename: 'style.css',
});

module.exports = {
  context: path.resolve(__dirname),  // absolute path for resolving entry point(s)
  devtool: 'inline-source-map',
  entry: [
    // sets up an ES6-ish environment with promise support
    'babel-polyfill',
    // webpack-hot-middleware needs this
    'webpack-hot-middleware/client',
    // the main application script
    ENTRY_PATH,
  ],
  output: {
    path: BUILD_PATH,
    filename: 'bundle.js',
    publicPath: '/', // where the generated static files reside.
  },
  resolve: {
    alias: {  // can do import Main from Components/Main/; instead of full path
      App: path.resolve(__dirname, 'app'),
      Actions: path.resolve(__dirname, 'app', 'actions'),
      Components: path.resolve(__dirname, 'app', 'components'),
      Constants: path.resolve(__dirname, 'app', 'constants'),
      Middleware: path.resolve(__dirname, 'app', 'middleware'),
      Utils: path.resolve(__dirname, 'app', 'utils'),
    },
    extensions: ['.js', '.jsx', '.json', '.node', '.png', '.css', '.scss'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: [{
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              'env',
              'stage-1',
              'react',
            ],
          },
        }],
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                // sourceMap: true,
                camelCase: true,
                localIdentName: '[local]__[hash:base64:13]',
              },
            },
            { loader: 'postcss-loader', options: { sourceMap: true } },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                data: `@import "${path.resolve(__dirname, 'app/stylesheets/theme.scss')}";`,
              },
            },
          ],
        }),
      },
      {
        test: /\.css$/,  // needed for css import in app/index.js
        use: extractSass.extract({
          fallback: 'style-loader',
          use: [
            { loader: 'css-loader', options: { sourceMap: true } },
          ],
        }),
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[sha512:hash:base64:7]_[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ['file-loader'],
      },
      {
        test: /\.(c|d|t)sv$/,
        use: ['dsv-loader'],
      },
    ],
  },
  plugins: [
    extractSass,
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.EnvironmentPlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
  ],
};
