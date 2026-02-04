const webpack = require('webpack');

module.exports = ({ config, mode }) => {
  // Add babel-loader rule ONLY for algoliasearch to handle modern JS syntax
  // (optional chaining, etc.) that Storybook 5.3.9/Webpack 4 can't parse.
  //
  // IMPORTANT: Do NOT include the project's own source files in this rule.
  // Vue SFC scripts are already processed by Storybook's built-in babel-loader
  // via vue-loader. Adding another babel-loader pass would cause
  // "export 'default' was not found" errors.
  config.module.rules.push({
    test: /\.js$/,
    include: /node_modules\/algoliasearch/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: { ie: 11 },
              },
            ],
          ],
        },
      },
    ],
  });

  config.plugins.push(
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(mode === 'DEVELOPMENT'),
    })
  );

  return config;
};
