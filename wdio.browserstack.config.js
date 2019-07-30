/* eslint-disable import/no-commonjs */

const config = {
  hostname: 'hub.browserstack.com',
  port: 443,
  baseUrl: '',
  user: process.env.BROWSERSTACK_USER,
  key: process.env.BROWSERSTACK_KEY,

  specs: ['./e2e/test.js'],
  maxInstances: 10,

  // Capabilities Generator
  // https://www.browserstack.com/automate/capabilities?tag=selenium-4
  commonCapabilities: {
    'browserstack.debug': true,
    'browserstack.video': true,
    'browserstack.console': 'verbose',
    'browserstack.networkLogs': true,
  },

  capabilities: [
    {
      os: 'Windows',
      osVersion: '10',
      resolution: '1680x1050',
      browserName: 'Chrome',
      browserVersion: '75.0',
    },
    {
      os: 'OS X',
      osVersion: 'Mojave',
      resolution: '1600x1200',
      browserName: 'Firefox',
      browserVersion: '68.0',
    },
    {
      osVersion: '12',
      deviceName: 'iPhone XS',
      realMobile: 'true',
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
