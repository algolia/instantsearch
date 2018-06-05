const fs = require('fs');
const { execSync } = require('child_process');

describe('Installation', () => {
  let temporaryDirectory;
  let appPath;

  beforeAll(() => {
    temporaryDirectory = execSync(
      'mktemp -d 2>/dev/null || mktemp -d -t "appPath"'
    )
      .toString()
      .trim();
  });

  afterAll(() => {
    execSync(`rm -rf "${temporaryDirectory}"`);
  });

  beforeEach(() => {
    appPath = `${temporaryDirectory}/test-app`;
    execSync(`mkdir ${appPath}`);
  });

  afterEach(() => {
    execSync(`rm -rf "${appPath}"`);
  });

  describe('Dependencies', () => {
    test('get installed by default', () => {
      execSync(
        `yarn start ${appPath} \
          --template "InstantSearch.js"`,
        { stdio: 'ignore' }
      );

      expect(fs.lstatSync(`${appPath}/node_modules`).isDirectory()).toBe(true);
    });

    test('get skipped with the `no-installation` flag', () => {
      execSync(
        `yarn start ${appPath} \
          --template "InstantSearch.js" \
          --no-installation`,
        { stdio: 'ignore' }
      );

      expect(fs.existsSync(`${appPath}/node_modules`)).toBe(false);
    });
  });

  describe('Path', () => {
    test('without conflict generates files', () => {
      execSync(
        `yarn start ${appPath} \
          --template "InstantSearch.js" \
          --no-installation`,
        { stdio: 'ignore' }
      );

      expect(fs.existsSync(`${appPath}/package.json`)).toBe(true);
    });

    test('with conflict with a non-empty folder cancels generation', () => {
      execSync(`echo 'hello' > ${appPath}/README.md`);

      expect(() => {
        execSync(
          `yarn start ${appPath} \
          --template "InstantSearch.js" \
          --no-installation`,
          { stdio: 'ignore' }
        );
      }).toThrow();

      expect(
        execSync(`grep "hello" ${appPath}/README.md`)
          .toString()
          .trim()
      ).toBe('hello');
    });

    test('with conflict with an existing file cancels generation', () => {
      execSync(`touch ${appPath}/file`);

      expect(() => {
        execSync(
          `yarn start ${appPath}/file \
          --template "InstantSearch.js" \
          --no-installation`,
          { stdio: 'ignore' }
        );
      }).toThrow();

      expect(fs.existsSync(`${appPath}/file`)).toBe(true);
    });
  });
});
