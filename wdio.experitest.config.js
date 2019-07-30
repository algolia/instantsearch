const config = {
  hostname: 'cloud.seetest.io',
  protocol: 'https',
  port: 443,

  specs: ['./e2e/test.js'],
  maxInstances: 10,

  // Capabilities Generator
  // https://cloud.seetest.io/index.html#/quickstart
  commonCapabilities: {},

  capabilities: [
    {
      browserName: 'chrome',
      browserVersion: '75.0.3770.142',
      platform: 'Mac OS X High Sierra',
      accessKey: process.env.EXPERITEST_ACCESS_KEY,
    },
    {
      browserName: 'firefox',
      browserVersion: '68.0.1',
      platform: 'Windows 10',

      accessKey: process.env.EXPERITEST_ACCESS_KEY,
    },
    {
      platformName: 'ios',
      deviceQuery: "@os='ios' and @version='12.0.1' and @category='PHONE'",

      accessKey: process.env.EXPERITEST_ACCESS_KEY,
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
