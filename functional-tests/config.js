import testServer from './testServer.js';
import {clearAll, searchBox} from './utils.js';

let conf = {
  specs: [
    'functional-tests/specs/**'
  ],
  reporters: ['dot'],
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 50000,
    compilers: ['js:babel-core/register']
  },
  baseUrl: 'http://localhost:9000',
  onPrepare() {
    return testServer.start();
  },
  before() {
    browser.timeoutsImplicitWait(500);
    browser.url('/');
    browser.waitForText('#hits', 30000);

    if (!browser.isMobile) {
      browser.windowHandle(handle => browser.windowHandleMaximize(handle));
    }
  },
  beforeTest() {
    clearAll();
    searchBox.clear();
  },
  onComplete() {
    testServer.stop();
  }
};

if (process.env.CI === 'true') {
  conf = {
    services: ['sauce'],
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    maxInstances: 5,
    sauceConnect: true,
    // we are not currently testing android nor microsoft edge
    // their selenium support is completely broken, nothing much to do here
    capabilities: [{
      browserName: 'chrome',
      platform: 'Windows 10',
      version: ''
    }, {
      browserName: 'internet explorer',
      platform: 'Windows 10',
      version: ''
    }, {
      browserName: 'safari',
      version: '9'
    }],
    ...conf
  };
} else {
  conf = {
    host: '127.0.0.1',
    port: 24444,
    path: '/wd/hub',
    capabilities: [{browserName: 'firefox'}],
    ...conf
  };
}

export default conf;
