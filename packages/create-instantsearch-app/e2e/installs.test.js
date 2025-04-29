const { execSync } = require('child_process');
const fs = require('fs');

describe('Installation', () => {
  let temporaryDirectory;
  let appPath;
  const appName = 'test-app';

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
    appPath = `${temporaryDirectory}/${appName}`;
    execSync(`mkdir ${appPath}`);
  });

  afterEach(() => {
    execSync(`rm -rf "${appPath}"`);
  });

  describe('Dependencies', () => {
    test('get skipped with the `no-installation` flag', () => {
      execSync(
        `yarn start ${appPath} \
          --name ${appName} \
          --template "InstantSearch.js" \
          --no-interactive \
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
          --name ${appName} \
          --template "InstantSearch.js" \
          --no-interactive \
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
          --name ${appName} \
          --template "InstantSearch.js" \
          --no-interactive \
          --no-installation`,
          { stdio: 'ignore' }
        );
      }).toThrow();

      expect(
        execSync(`grep "hello" ${appPath}/README.md`).toString().trim()
      ).toBe('hello');
    });

    test('with conflict with an existing file cancels generation', () => {
      execSync(`touch ${appPath}/file`);

      expect(() => {
        execSync(
          `yarn start ${appPath}/file \
          --name ${appName} \
          --template "InstantSearch.js" \
          --no-interactive \
          --no-installation`,
          { stdio: 'ignore' }
        );
      }).toThrow();

      expect(fs.existsSync(`${appPath}/file`)).toBe(true);
    });
  });

  describe('Arguments', () => {
    test('uses name from argument', () => {
      execSync(
        `yarn start ${appPath} \
          --name ${appName} \
          --template "InstantSearch.js" \
          --no-interactive \
          --no-installation`,
        { stdio: 'ignore' }
      );

      const { name } = require(`${appPath}/package.json`);

      expect(name).toBe(appName);
    });

    test('uses name from path', () => {
      execSync(
        `yarn start ${appPath} \
          --template "InstantSearch.js" \
          --no-interactive \
          --no-installation`,
        { stdio: 'ignore' }
      );

      const { name } = require(`${appPath}/package.json`);

      expect(name).toBe(appName);
    });

    test('uses template from argument (vanilla)', () => {
      execSync(
        `yarn start ${appPath} \
          --name ${appName} \
          --template "InstantSearch.js" \
          --no-interactive \
          --no-installation`,
        { stdio: 'ignore' }
      );

      const { dependencies } = require(`${appPath}/package.json`);

      expect(dependencies['instantsearch.js']).toEqual(expect.any(String));
    });

    test('uses template from argument (react)', () => {
      execSync(
        `yarn start ${appPath}/react \
          --name ${appName} \
          --template "React InstantSearch" \
          --no-interactive \
          --no-installation`,
        { stdio: 'ignore' }
      );

      const { dependencies } = require(`${appPath}/react/package.json`);

      expect(dependencies['react-instantsearch']).toEqual(expect.any(String));
    });

    test('without template fails', () => {
      expect(() => {
        execSync(
          `yarn start ${appPath} \
            --no-interactive \
            --no-installation`,
          { stdio: 'ignore' }
        );
      }).toThrow();
    });
  });
});
