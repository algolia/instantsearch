const path = require('path');

const { ALL_FLAVORS } = require('./flavors');

module.exports = {
  /*
   * Use the Static Server Service to start serve demos to run our tests against
   * https://webdriver.io/docs/static-server-service.html
   * https://github.com/webdriverio/webdriverio/tree/master/packages/wdio-static-server-service
   */
  services: ['static-server'],
  staticServerFolders: [
    {
      mount: '/',
      path: './website',
    },
    ...ALL_FLAVORS.map((flavor) => ({
      mount: `/examples/${flavor}/e-commerce/*`,
      path: `./website/examples/${flavor}/e-commerce`,
    })),
  ],
  staticServerPort: 5000,
  /*
   * Set the static server, started above, as the base URL
   * Will be prepended to the `url` parameter of `browser.url()` calls
   * https://webdriver.io/docs/configurationfile.html
   * https://webdriver.io/docs/api/browser/url.html
   */
  baseUrl: 'http://localhost:5000',

  /*
   * Specify Test Files
   * Using absolute path to run test files from the package root
   * instead of the directory from which `wdio` was called
   * https://webdriver.io/docs/configurationfile.html
   */
  specs: [path.join(__dirname, 'all-flavors.spec.ts')],

  /*
   * Level of logging verbosity
   * Can be: trace, debug, info, warn, error, silent
   * https://webdriver.io/docs/options.html#loglevel
   */
  logLevel: 'warn',
  /*
   * Default timeout for all waitForXXX commands
   * https://webdriver.io/docs/options.html#waitfortimeout
   */
  waitforTimeout: 10000,
  /*
   * Stop tests on first fail
   * https://webdriver.io/docs/options.html#bail
   */
  bail: 1,

  /*
   * Uses Jasmine as test framework
   * Since Jest is not supported by WebdriverIO yet we choose to use the Jasmine framework as it has a very close syntax
   * https://webdriver.io/docs/options.html#framework
   * https://github.com/webdriverio/webdriverio/tree/master/packages/wdio-jasmine-framework
   */
  framework: 'jasmine',
  /*
   * Specific Jasmine related options
   * https://webdriver.io/docs/options.html#mochaopts-jasminenodeopts
   * https://github.com/webdriverio/webdriverio/tree/master/packages/wdio-jasmine-framework#configuration
   */
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000,
  },
  /*
   * List of reporters to use
   * https://webdriver.io/docs/options.html#reporters
   * https://github.com/webdriverio/webdriverio/tree/master/packages/wdio-spec-reporter
   */
  reporters: ['spec'],

  /*
   * Hooks
   * https://webdriver.io/docs/options.html#hooks
   */
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
      project: path.join(__dirname, './tsconfig.json'),
    });

    /*
     * Register helpers
     * https://webdriver.io/docs/customcommands.html
     */
    require('./helpers');
  },

  async beforeSuite() {
    if (!browser.isMobile) {
      await browser.maximizeWindow();
    }
  },
};
