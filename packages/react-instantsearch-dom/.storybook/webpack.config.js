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
              exclude: /node_modules|algoliasearch-helper/,
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
