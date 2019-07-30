const config = {
  hostname: 'hub.crossbrowsertesting.com',
  port: 80,
  baseUrl: '',
  user: process.env.CBT_USER,
  key: process.env.CBT_KEY,
  services: ['crossbrowsertesting'],

  specs: ['./e2e/test.js'],
  maxInstances: 10,

  // Capabilities Generator
  // https://app.crossbrowsertesting.com/selenium/run
  commonCapabilities: {
    record_video: 'true',
    record_network: 'true',
  },

  capabilities: [
    {
      browserName: 'Chrome',
      version: '75',
      platform: 'Windows 10',
      screenResolution: '1680x1050',
    },
    {
      browserName: 'Firefox',
      platform: 'Mac OSX 10.14',
      screenResolution: '1440x1050',
    },
    {
      browserName: 'Safari',
      deviceName: 'iPhone XR Simulator',
      platformVersion: '12.0',
      platformName: 'iOS',
      deviceOrientation: 'portrait',
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
