const path = require('path');
const glob = require('glob');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const outputPath = path.join(__dirname, 'dist');
const examples = glob.sync(path.join('examples', '*'), {
  cwd: __dirname,
});

module.exports = {
  mode: 'production',
  entry: examples.reduce(
    (acc, example) => ({
      ...acc,
      [example]: path.join(__dirname, example, 'index.js'),
    }),
    {}
  ),
  output: {
    filename: '[name]/index.[chunkhash].js',
    path: outputPath,
  },
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              rootMode: 'upward',
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
    ],
  },
  performance: {
    hints: false,
  },
  plugins: examples
    .map(
      example =>
        new HTMLWebpackPlugin({
          template: path.join(__dirname, example, 'index.html'),
          filename: path.join(outputPath, example, 'index.html'),
          chunks: [example],
        })
    )
    .concat([
      new CopyWebpackPlugin([
        { from: path.join(__dirname, 'assets'), to: 'assets/' },
        path.join(__dirname, '_redirects'),
      ]),
    ]),
};
