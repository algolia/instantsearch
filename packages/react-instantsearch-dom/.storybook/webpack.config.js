/* eslint-disable import/no-commonjs */
module.exports = {
  module: {
    loaders: [
      {
        test: /\.css?$/,
        loaders: ['style-loader',
          'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'],
      },
    ],
  },
};
/* eslint-enable import/no-commonjs */
