module.exports = function(config) {
  config.set({
    browsers: ['Chrome'],
    frameworks: ['mocha'],
    reporters: ['progress'],

    basePath: '',

    preprocessors: {
      '@(src)/**/*-test.js': ['webpack', 'sourcemap']
    },

    files: [
      '@(src)/**/*-test.js'
    ],

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [{
          test: /\.js$/, exclude: /node_modules/, loader: 'babel'
        }, {
          test: /\.json$/, exclude: /node_modules/, loader: 'json'
        }]
      }
    },

    webpackMiddleware: {
      noInfo: true
    }
  });
};
