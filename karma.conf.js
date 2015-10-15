module.exports = function(config) {
  config.set({
    browsers: ['Chrome'],
    frameworks: ['phantomjs-shim', 'mocha'],
    reporters: ['progress'],

    basePath: '',

    preprocessors: {
      '@(components|lib|widgets)/**/*-test.js': ['webpack', 'sourcemap']
    },

    files: [
      '@(components|lib|widgets)/**/*-test.js'
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
