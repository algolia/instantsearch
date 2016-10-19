/* eslint-disable import/no-commonjs */
module.exports = {
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style',
      }, {
        test: /\.css$/,
        loader: 'css',
        query: {
          modules: true,
          importLoaders: 1,
          localIdentName: 'ais-[name]__[local]',
        },
      },
    ],
  },
};
/* eslint-enable import/no-commonjs */
