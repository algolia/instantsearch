exports.config = {
  runner: 'local',
  specs: ['./__tests__/e2e/**/*.test.ts'],
  logLevel: 'info',
  bail: 1,
  baseUrl: 'http://localhost:3000',
  waitforTimeout: 10000,
  services: ['selenium-standalone'],
  seleniumInstallArgs: { drivers: { chrome: { version: '2.43' } } },
  capabilities: [
    {
      browserName: 'chrome',
    },
  ],

  framework: 'jasmine',

  reporters: ['spec'],

  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000,
  },

  before() {
    /*
     * Register TypeScript to compile our `.ts` files
     * https://webdriver.io/docs/typescript.html
     */
    require('ts-node').register({
      // Only transpile our files without typechecking them, it makes test
      // faster and exempts us from installing type definitions to run them
      transpileOnly: true,
      // Force `ts-node` to compile files in `node_modules` directory
      // (ignored by default), since our tests will be stored in it
      ignore: [],
      // Force `ts-node` to use the config file from the package root
      // instead of the directory from which `wdio` was called
      project: './tsconfig.wdio.json',
    });
  },
};
