/* eslint-disable import/no-commonjs */
module.exports = {
  module: {
    loaders: [
      {
        test: /\.css?$/,
        loaders: ['style-loader',
          'css-loader?modules&importLoaders=1&localIdentName=ais-[name]__[local]'],
      },
    ],
  },
};
/* eslint-enable import/no-commonjs */
