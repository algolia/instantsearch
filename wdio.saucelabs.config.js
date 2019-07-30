/* eslint-disable import/no-commonjs */

const config = {
  hostname: 'ondemand.eu-central-1.saucelabs.com',
  port: 443,
  user: process.env.SAUCELABS_USER,
  key: process.env.SAUCELABS_KEY,

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
};

// Map common capabilities to capabilities
config.capabilities = config.capabilities.map(capability => ({
  ...config.commonCapabilities,
  ...capability,
}));

exports.config = config;
