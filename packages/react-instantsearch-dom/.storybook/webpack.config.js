/* eslint-disable import/no-commonjs */

module.exports = ({ config }) => ({
  ...config,
  module: {
    ...config.module,
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              rootMode: 'upward',
              presets: [['react-app', { typescript: true }]],
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
});
