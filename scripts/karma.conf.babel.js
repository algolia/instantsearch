import {join} from 'path';

let baseConfig = {
  frameworks: ['mocha'],
  basePath: join(__dirname, '..'),
  preprocessors: {'scripts/unit-tests-bundle.js': ['webpack', 'sourcemap']},
  files: ['scripts/unit-tests-bundle.js'],
  webpack: {
    devtool: 'inline-source-map',
    module: {
      loaders: [{
        test: /\.js$/, exclude: /node_modules/, loader: 'babel'
      }]
    },
    // enzyme does not work well with webpack:
    // https://github.com/airbnb/enzyme/issues/47#issuecomment-165430136
    externals: {
      jsdom: 'window',
      cheerio: 'window',
      'react/lib/ExecutionEnvironment': true,
      'react/lib/ReactContext': 'window',
      'text-encoding': 'window'
    }
  },
  webpackMiddleware: {noInfo: true}
};

if (process.env.CI === 'true') {
  let customLaunchers = {
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 10',
      version: ''
    }/* ,
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      platform: 'Windows 10',
      version: ''
    },
    sl_ie_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 10',
      version: ''
    },
    sl_safari: {
      base: 'SauceLabs',
      browserName: 'safari',
      version: '9'
    },
    sl_iphone: {
      base: 'SauceLabs',
      deviceName: 'iPhone 6 Plus',
      platform: 'OS X 10.10',
      version: '9.2',
      deviceOrientation: 'portrait'
    }*/
  };

  baseConfig = {
    browserNoActivityTimeout: 120000,
    captureTimeout: 120000,
    singleRun: true,
    reporters: ['dots', 'saucelabs'],
    sauceLabs: {
      startConnect: false, // sauce connect already started by travis
      testName: 'unit',
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    },
    customLaunchers,
    browsers: Object.keys(customLaunchers),
    ...baseConfig
  };
} else {
  baseConfig = {
    browsers: ['Chrome'],
    reporters: ['progress'],
    ...baseConfig
  };
}

module.exports = config => config.set(baseConfig); // eslint-disable-line algolia/no-module-exports
