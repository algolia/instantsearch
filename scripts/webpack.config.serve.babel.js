import webpack from 'webpack';
import baseConfig from './webpack.config.jsdelivr.babel.js';

export default {
  ...baseConfig,
  plugins: [
    ...baseConfig.plugins,
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
};
