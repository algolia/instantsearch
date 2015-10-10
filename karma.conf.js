module.exports = function(config) {
  config.set({
    browsers: ['ChromeCanary'],
    frameworks: ['phantomjs-shim', 'mocha'],
    reporters: ['mocha'],

    basePath: '',

    preprocessors: {
      'components/**/*-test.js': ['webpack', 'sourcemap']
    },

    files: [
      'components/**/*-test.js'
    ],

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [{
          test: /\.js$/, exclude: /node_modules/, loader: 'babel'
        }]
      }
    },

    webpackMiddleware: {
      noInfo: true
    }
  });
};
