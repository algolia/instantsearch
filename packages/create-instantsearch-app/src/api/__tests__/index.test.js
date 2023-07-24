const path = require('path');

const createInstantSearchAppFactory = require('../');

let setupSpy;
let buildSpy;
let installSpy;
let cleanSpy;
let teardownSpy;
let createInstantSearchApp;

beforeEach(() => {
  setupSpy = jest.fn(() => Promise.resolve());
  buildSpy = jest.fn(() => Promise.resolve());
  installSpy = jest.fn(() => Promise.resolve());
  cleanSpy = jest.fn(() => Promise.resolve());
  teardownSpy = jest.fn(() => Promise.resolve());

  createInstantSearchApp = (appPath, config) =>
    createInstantSearchAppFactory(appPath, config, {
      setup: setupSpy,
      build: buildSpy,
      install: installSpy,
      clean: cleanSpy,
      teardown: teardownSpy,
    });
});

describe('Options', () => {
  test('without path throws', () => {
    expect(() => {
      createInstantSearchApp('', {});
    }).toThrowErrorMatchingSnapshot();
  });

  test('without template throws', () => {
    expect(() => {
      createInstantSearchApp('/tmp/test-app', {});
    }).toThrowErrorMatchingSnapshot();
  });

  test('with unknown template throws', () => {
    expect(() => {
      createInstantSearchApp('/tmp/test-app', {
        template: 'UnknownTemplate',
      });
    }).toThrowErrorMatchingSnapshot();
  });

  test('with correct template does not throw', () => {
    expect(() => {
      createInstantSearchApp('/tmp/test-app', {
        template: 'InstantSearch.js',
      });
    }).not.toThrow();
  });

  test('with correct template path does not throw', () => {
    expect(() => {
      createInstantSearchApp('/tmp/test-app', {
        template: path.resolve('src/templates/InstantSearch.js'),
      });
    }).not.toThrow();
  });

  test('with wrong template path throws', () => {
    expect(() => {
      createInstantSearchApp('/tmp/test-app', {
        template: path.resolve('./templates'),
      });
    }).toThrowErrorMatchingSnapshot();
  });

  test('with invalid name throws', () => {
    expect(() => {
      createInstantSearchApp('/tmp/test-app', {
        name: './WrongNpmName',
        template: 'InstantSearch.js',
      });
    }).toThrowErrorMatchingSnapshot();
  });
});

describe('Tasks', () => {
  describe('build', () => {
    test('gets called', async () => {
      expect.assertions(2);

      const app = createInstantSearchApp('/tmp/test-app', {
        template: 'InstantSearch.js',
        libraryVersion: '3.0.0',
      });

      await app.create();

      expect(buildSpy).toHaveBeenCalledTimes(1);
      expect(buildSpy).toHaveBeenCalledWith({
        path: '/tmp/test-app',
        name: 'test-app',
        template: path.resolve('src/templates/InstantSearch.js'),
        installation: true,
        libraryVersion: '3.0.0',
        silent: false,
      });
    });
  });

  describe('install', () => {
    test('with installation set to `undefined` calls the `install` task', async () => {
      expect.assertions(1);

      const app = createInstantSearchApp('/tmp/test-app', {
        template: 'InstantSearch.js',
      });

      await app.create();

      expect(installSpy).toHaveBeenCalledTimes(1);
    });

    test('with installation calls the `install` task', async () => {
      expect.assertions(1);

      const app = createInstantSearchApp('/tmp/test-app', {
        template: 'InstantSearch.js',
        installation: true,
      });

      await app.create();

      expect(installSpy).toHaveBeenCalledTimes(1);
    });

    test('without installation does not call the `install` task', async () => {
      expect.assertions(1);

      const app = createInstantSearchApp('/tmp/test-app', {
        template: 'InstantSearch.js',
        installation: false,
      });

      await app.create();

      expect(installSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('lifecycle', () => {
    test('without interruption should not call clean task', async () => {
      expect.assertions(5);

      const app = createInstantSearchApp('/tmp/test-app', {
        template: 'InstantSearch.js',
      });

      await app.create();

      expect(setupSpy).toHaveBeenCalledTimes(1);
      expect(buildSpy).toHaveBeenCalledTimes(1);
      expect(installSpy).toHaveBeenCalledTimes(1);
      expect(cleanSpy).toHaveBeenCalledTimes(0);
      expect(teardownSpy).toHaveBeenCalledTimes(1);
    });

    test('with failing setup should stop the execution', async () => {
      expect.assertions(5);

      const failingSetupSpy = jest.fn(() => Promise.reject(new Error()));

      const app = createInstantSearchAppFactory(
        '/tmp/test-app',
        {
          template: 'InstantSearch.js',
        },
        {
          setup: failingSetupSpy,
          build: buildSpy,
          install: installSpy,
          clean: cleanSpy,
          teardown: teardownSpy,
        }
      );

      await app.create();

      expect(failingSetupSpy).toHaveBeenCalledTimes(1);
      expect(buildSpy).toHaveBeenCalledTimes(0);
      expect(installSpy).toHaveBeenCalledTimes(0);
      expect(cleanSpy).toHaveBeenCalledTimes(0);
      expect(teardownSpy).toHaveBeenCalledTimes(0);
    });

    test('with failing build should stop the execution', async () => {
      expect.assertions(5);

      const failingBuildSpy = jest.fn(() => Promise.reject(new Error()));

      const app = createInstantSearchAppFactory(
        '/tmp/test-app',
        {
          template: 'InstantSearch.js',
        },
        {
          setup: setupSpy,
          build: failingBuildSpy,
          install: installSpy,
          clean: cleanSpy,
          teardown: teardownSpy,
        }
      );

      await app.create();

      expect(setupSpy).toHaveBeenCalledTimes(1);
      expect(failingBuildSpy).toHaveBeenCalledTimes(1);
      expect(installSpy).toHaveBeenCalledTimes(0);
      expect(cleanSpy).toHaveBeenCalledTimes(0);
      expect(teardownSpy).toHaveBeenCalledTimes(0);
    });

    test('with failing install should call clean task and stop the execution', async () => {
      expect.assertions(5);

      const failingInstallSpy = jest.fn(() => Promise.reject(new Error()));

      const app = createInstantSearchAppFactory(
        '/tmp/test-app',
        {
          template: 'InstantSearch.js',
        },
        {
          setup: setupSpy,
          build: buildSpy,
          install: failingInstallSpy,
          clean: cleanSpy,
          teardown: teardownSpy,
        }
      );

      await app.create();

      expect(setupSpy).toHaveBeenCalledTimes(1);
      expect(buildSpy).toHaveBeenCalledTimes(1);
      expect(failingInstallSpy).toHaveBeenCalledTimes(1);
      expect(cleanSpy).toHaveBeenCalledTimes(1);
      expect(teardownSpy).toHaveBeenCalledTimes(0);
    });
  });
});
