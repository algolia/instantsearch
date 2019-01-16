const path = require('path');

module.exports = {
  target: 'node',
  entry: path.resolve(__dirname, 'getStorybookStories.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'getStorybookStoriesBundle.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
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
        use: [{ loader: 'null-loader' }],
      },
    ],
  },
};
