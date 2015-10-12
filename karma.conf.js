module.exports = function(config) {
  config.set({
    browsers: ['Chrome'],
    frameworks: ['phantomjs-shim', 'mocha'],
    reporters: ['mocha'],

    basePath: '',

    preprocessors: {
      '@(components|lib)/**/*-test.js': ['webpack', 'sourcemap']
    },

    files: [
      '@(components|lib)/**/*-test.js'
    ],

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [{
          test: /\.js$/, exclude: /node_modules/, loader: 'babel?plugins=rewire'
        }]
      }
    },

    webpackMiddleware: {
      noInfo: true
    }
  });
};
