import baseConfig from './webpack.config.jsdelivr.babel.js';

export default {
  ...baseConfig,
  output: {
    path: './dist/',
    filename: 'instantsearch-preact.js',
    library: 'instantsearch',
    libraryTarget: 'umd',
  },
  resolve: {
    alias: {
      'react': 'preact-compat',
      'react-dom': 'preact-compat',
    },
    ...baseConfig.resolve,
  },
};
