/* eslint-disable import/no-commonjs */

module.exports = {
  webpack: config => {
    // Fixes npm packages that depend on `fs` module
    config.node = {
      fs: 'empty',
    };
    config.module.rules.push({
      test: /\.css$/,
      loader: ['style-loader', 'css-loader'],
    });

    return config;
  },
};
