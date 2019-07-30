const config = {
  hostname: 'hub.lambdatest.com',
  port: 80,
  baseUrl: '',
  user: process.env.LT_USER,
  key: process.env.LT_KEY,

  specs: ['./e2e/test.js'],
  maxInstances: 10,

  // Capabilities Generator
  // https://www.lambdatest.com/capabilities-generator/
  commonCapabilities: {
    visual: true,
    video: true,
    console: true,
    network: true,
  },

  capabilities: [
    {
      platform: 'Windows 10',
      browserName: 'Chrome',
      version: '76.0',
      resolution: '1680x1050',
    },
    {
      platform: 'macOS Mojave',
      browserName: 'Firefox',
      version: '67.0',
      resolution: '1600x900',
    },
    // No mobile test :(
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
