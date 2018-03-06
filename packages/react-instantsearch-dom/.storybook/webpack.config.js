// eslint-disable-next-line import/no-commonjs
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: /node_modules\/(stringify-object|get-own-enumerable-property-symbols)/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
