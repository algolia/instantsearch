/* eslint-disable import/no-commonjs, no-console */
const handler = require('serve-handler');
const http = require('http');

const config = {
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  services: ['sauce'],
  region: 'eu',
  sauceConnect: true,
  sauceConnectOpts: {
    x: 'https://eu-central-1.saucelabs.com/rest/v1',
  },

  specs: ['./e2e/test.js'],
  maxInstances: 10,

  // Capabilities Generator
  // https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
  commonCapabilities: {},

  capabilities: [
    {
      browserName: 'chrome',
      platform: 'Windows 10',
      version: '75.0',
      screenResolution: '1680x1050',
      extendedDebugging: true,
      capturePerformance: true,
    },
    {
      browserName: 'firefox',
      // https://github.com/webdriverio/webdriverio/issues/3443
      'sauce:options': {
        seleniumVersion: '3.11.0',
      },
    },
    {
      browserName: 'Safari',
      deviceName: 'iPhone XS Simulator',
      deviceOrientation: 'portrait',
      platformVersion: '12.2',
      platformName: 'iOS',
    },
  ],

  logLevel: 'trace',
  coloredLogs: true,
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 0,

  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },

  onPrepare() {
    http
      .createServer((request, response) =>
        handler(request, response, { public: 'website' })
      )
      .listen(5000, () => {
        console.log('Running at http://localhost:5000');
      });
  },
};

// Map common capabilities to capabilities
config.capabilities = config.capabilities.map(capability => ({
  ...config.commonCapabilities,
  ...capability,
}));

exports.config = config;
