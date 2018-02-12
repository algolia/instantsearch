import path from 'path';
import { SaveScreenshot } from 'wdio-visual-regression-service/compare';
import testServer from './testServer.js';
import { clearAll, searchBox } from './utils.js';
const INDEX_PAGE = process.env.INDEX_PAGE || 'index';

function screenshotName(context) {
  const testName = context.test.title.replace(/ /g, '_');
  const name = context.browser.name.toLocaleLowerCase().replace(/ /g, '_');
  const { width, height } = context.meta.viewport;

  return path.join(
    __dirname,
    'screenshots',
    `${testName}_${name}_${width}x${height}.png`
  );
}

let conf = {
  specs: ['./functional-tests/test.js'],
  reporters: ['dot'],
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 50000,
    compilers: ['js:babel-core/register'],
  },
  baseUrl: `http://${process.env.CI === 'true'
    ? 'localhost'
    : '10.200.10.1'}:9000`,
  services: ['visual-regression'],
  visualRegression: {
    compare: new SaveScreenshot({
      screenshotName,
    }),
    viewportChangePause: 300, // ms
  },
  onPrepare() {
    return testServer.start();
  },
  before() {
    browser.timeouts('implicit', 500);
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
    ...conf,
    services: [...conf.services, 'sauce'],
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    maxInstances: 5,
    sauceConnect: true,
    // See https://github.com/bermi/sauce-connect-launcher
    sauceConnectOpts: {
      // Log output from the `sc` process to stdout?
      verbose: true,
      // retry to establish a tunnel multiple times. (optional)
      connectRetries: 2,
      // retry to download the sauce connect archive multiple times. (optional)
      downloadRetries: 2,
    },
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
  };
} else {
  conf = {
    host: '127.0.0.1',
    port: 4444,
    path: '/wd/hub',
    capabilities: [{ browserName: 'firefox' }],
    ...conf,
  };
}

export default conf;
