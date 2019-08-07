const baseConfig = require('./wdio.base.conf');

module.exports = {
  ...baseConfig,
  /*
   * Start a Selenium Standalone Service to run our tests on our local machine
   * https://webdriver.io/docs/selenium-standalone-service.html
   * https://github.com/webdriverio/webdriverio/tree/master/packages/wdio-selenium-standalone-service
   */
  services: [...(baseConfig.services || []), 'selenium-standalone'],
  /*
   * Platforms where we want to run our tests
   * Since it will be run on the local machine and we don't know any of its capacity
   * then we stay very vague and only target the most common browser
   */
  capabilities: [
    {
      browserName: 'chrome',
    },
  ],
};
