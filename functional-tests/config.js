import startServer from './startServer';

let conf = {
  specs: [
    'functional-tests/boot.js',
    'functional-tests/specs/**'
  ],
  mochaOpts: {
    ui: 'bdd',
    timeout: 50000,
    compilers: ['js:babel-core/register']
  },
  coloredLogs: false,
  baseUrl: 'http://localhost:9000',
  framework: 'mocha',
  onPrepare() {
    return startServer();
  },
  before() {
    let init = browser
      .timeoutsImplicitWait(500)
      .url('/')
      .waitForText('#hits', 30000);

    if (!browser.isMobile) {
      init = init.windowHandle(handle => browser.windowHandleMaximize(handle));
    }

    return init;
  },
  onComplete() {
    console.log('that\'s it');
  }
};

if (process.env.CI === 'true') {
  const defaultCapabilities = {
    build: process.env.TRAVIS_BUILD_NUMBER,
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    name: 'instantsearch.js functional tests'
  };

  conf = {
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    // we are not currently testing android nor microsoft edge
    // their selenium support is completely broken, nothing much to do here
    capabilities: [{
      browserName: 'chrome',
      platform: 'Windows 10',
      version: '',
      ...defaultCapabilities
    }, {
      browserName: 'firefox',
      platform: 'Windows 10',
      version: '',
      ...defaultCapabilities
    }, {
      browserName: 'internet explorer',
      platform: 'Windows 10',
      version: '',
      ...defaultCapabilities
    }, {
      browserName: 'safari',
      version: '9',
      ...defaultCapabilities
    }],
    ...conf
  };
} else {
  conf = {
    host: '0.0.0.0',
    port: 24444,
    path: '/wd/hub',
    capabilities: [{browserName: 'firefox'}],
    ...conf
  };
}

export default conf;
