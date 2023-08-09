require('dotenv').config();

const baseConfig = require('./wdio.base.conf');

module.exports = {
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
        /**
         * @param {{ cid: string; capabilities: { browserName: string; browserVersion: string; }; }} opts
         */
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
   * Add Sauce Labs integration to WebdriverIO
   * https://webdriver.io/docs/sauce-service.html
   * https://github.com/webdriverio/webdriverio/tree/master/packages/wdio-sauce-service
   */
  services: [...(baseConfig.services || []), 'sauce'],
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
   * Retry spec files 2 times maximum on fail
   * This is usefull is case of a flacky test
   * https://webdriver.io/docs/options.html#specfileretries
   */
  specFileRetries: 2,

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
    {
      browserName: 'firefox',
      browserVersion: '68.0',
      /*
       * Sauce Labs specific options
       * https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options
       */
      'sauce:options': {
        screenResolution: '1680x1050',
        // Force Selenium version on Firefox, solves an issue with `setValue`
        // https://github.com/webdriverio/webdriverio/issues/3443
        seleniumVersion: '3.11.0',
      },
    },
    // {
    //   browserName: 'internet explorer',
    //   browserVersion: '11.285',
    //   /*
    //    * Sauce Labs specific options
    //    * https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options
    //    */
    //   'sauce:options': {
    //     screenResolution: '1680x1050',
    //   },
    //   'se:ieOptions': {
    //     // Required for drag and drop to work
    //     // https://stackoverflow.com/questions/14299392/selenium-webdriver-draganddrop-for-ie9
    //     requireWindowFocus: true,
    //   },
    // },
  ],
};
