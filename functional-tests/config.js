import testServer from './testServer.js';
import {clearAll, searchBox} from './utils.js';
const INDEX_PAGE = process.env.INDEX_PAGE || 'index.html';

let conf = {
  specs: [
    'functional-tests/specs/**',
  ],
  reporters: ['dot'],
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 50000,
    compilers: ['js:babel-core/register'],
  },
  baseUrl: 'http://localhost:9000',
  onPrepare() {
    return testServer.start();
  },
  before() {
    browser.timeoutsImplicitWait(500);
    browser.url(`/${INDEX_PAGE}.html`);
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
  },
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
    capabilities: [
      {
        browserName: 'chrome',
        platform: 'Windows 10',
        version: '', // latest stable
        screenResolution: '1280x1024',
      },
      {
        browserName: 'internet explorer',
        platform: 'Windows 10',
        version: '11',
        screenResolution: '1280x1024',
      },
      {
        browserName: 'safari',
        version: '9',
      },
      {
        browserName: 'MicrosoftEdge',
        platform: 'Windows 10',
        version: '',
        screenResolution: '1280x1024',
      },
      // Firefox disabled, Firefox selenium support is not yet good
      // {
      //   browserName: 'firefox',
      //   platform: 'Windows 10',
      //   version: '', // latest stable
      //   screenResolution: '1280x1024'
      // }
      // iOS disabled, cannot start any mobile in a reliable way on SauceLabs
      // {
      //   browserName: 'Safari',
      //   appiumVersion: '1.5.3',
      //   deviceName: 'iPhone 6 Simulator',
      //   deviceOrientation: 'portrait',
      //   platformVersion: '9.3',
      //   platformName: 'iOS'
      // },
    ],
    ...conf,
  };
} else {
  conf = {
    host: '127.0.0.1',
    port: 24444,
    path: '/wd/hub',
    capabilities: [{browserName: 'firefox'}],
    ...conf,
  };
}

export default conf;
