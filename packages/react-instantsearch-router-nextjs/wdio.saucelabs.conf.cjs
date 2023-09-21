const { config: baseConfig } = require('./wdio.conf.cjs');

exports.config = {
  ...baseConfig,
  /*
   * List of reporters to use
   * https://webdriver.io/docs/options.html#reporters
   * https://github.com/webdriverio/webdriverio/tree/master/packages/wdio-spec-reporter
   */
  reporters: [
    'spec',
    [
      'junit',
      {
        outputDir: `${process.cwd()}/junit/wdio`,
        outputFileFormat({
          cid,
          capabilities: { browserName, browserVersion },
        }) {
          return `results-${cid}.${browserName}-${browserVersion}.xml`;
        },
        addFileAttribute: true,
      },
    ],
  ],
  /*
   * Level of logging verbosity
   * Can be: trace, debug, info, warn, error, silent
   * https://webdriver.io/docs/options.html#loglevel
   */
  logLevel: 'warn',
  /*
   * Add Sauce Labs integration to WebdriverIO
   * https://webdriver.io/docs/sauce-service.html
   * https://github.com/webdriverio/webdriverio/tree/master/packages/wdio-sauce-service
   */
  services: ['sauce'],
  /*
   * Sauce Labs credentials
   * Can be set in environement variables or in a `.env` file in
   * the directory from which `wdio` was called
   */
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  /*
   * Sauce Connect Proxy
   * Open tunnel between Sauce Labs and the machine running our static server
   * https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy
   */
  sauceConnect: true,
  /*
   * Apply Sauce Connect options
   * https://webdriver.io/docs/sauce-service.html#sauceconnectopts
   */
  sauceConnectOpts: {
    /*
     * Retry to establish a tunnel 2 times maximum on fail
     * This is useful to prevent premature test failure if we have difficulties to open the tunnel
     * (can happen if there are already multiple tunnels opened on SauceLabs)
     * https://github.com/bermi/sauce-connect-launcher#advanced-usage
     */
    connectRetries: 2,
    connectRetryTimeout: 10000,
  },
  /*
   * Sauce Labs Open Source offer has a maximum of 5 concurrent session
   */
  maxInstances: 5,

  /*
   * Platforms where we want to run our tests
   * https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
   */
  capabilities: [
    {
      browserName: 'chrome',
      browserVersion: '76.0',
      /*
       * Sauce Labs specific options
       * https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options
       */
      'sauce:options': {
        screenResolution: '1680x1050',
      },
    },
  ],
};
