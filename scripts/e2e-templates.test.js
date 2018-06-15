const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const walkSync = require('walk-sync');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const templatesFolder = path.join(__dirname, '../src/templates');
const templates = fs
  .readdirSync(templatesFolder)
  .map(name => path.join(templatesFolder, name))
  .filter(source => fs.lstatSync(source).isDirectory());

describe('Templates', () => {
  templates.forEach(templatePath => {
    const templateName = path.basename(templatePath);
    const templateConfig = require(`${templatePath}/.template.js`);

    describe(templateName, () => {
      let temporaryDirectory;
      let appPath;
      let configFilePath;
      let generatedFiles;

      beforeAll(() => {
        temporaryDirectory = execSync(
          'mktemp -d 2>/dev/null || mktemp -d -t "appPath"'
        )
          .toString()
          .trim();

        appPath = `${temporaryDirectory}/${templateConfig.appName}`;

        const config = {
          name: `${templateConfig.appName}`,
          template: templateName,
          libraryVersion: '1.0.0',
          appId: 'appId',
          apiKey: 'apiKey',
          indexName: 'indexName',
          searchPlaceholder: 'Search placeholder',
          mainAttribute: 'mainAttribute',
          attributesForFaceting: ['facet1', 'facet2'],
        };

        configFilePath = `${temporaryDirectory}/${
          templateConfig.appName
        }.config.json`;

        fs.writeFileSync(configFilePath, JSON.stringify(config));

        execSync(
          `yarn start ${appPath} \
              --config ${configFilePath} \
              --no-installation`,
          { stdio: 'ignore' }
        );

        const ignoredFiles = fs
          .readFileSync(`${appPath}/.gitignore`)
          .toString()
          .split('\n')
          .filter(line => !line.startsWith('#'))
          .filter(Boolean)
          .concat('.DS_Store');

        generatedFiles = walkSync(appPath, {
          directories: false,
          ignore: ignoredFiles,
        });
      });

      afterAll(() => {
        execSync(`rm -rf "${temporaryDirectory}"`);
      });

      test('Folder structure', () => {
        expect(generatedFiles).toMatchSnapshot('contains the right files');
      });

      test('File content', () => {
        generatedFiles.forEach(filePath => {
          if (['.png', '.ico', '.jpg'].includes(filePath.slice(-4))) {
            const image = fs.readFileSync(`${templatePath}/${filePath}`);

            expect(image).toMatchImageSnapshot({
              customSnapshotIdentifier: `e2e-installs-${
                templateConfig.templateName
              }-${path.basename(filePath)}`,
            });
          } else {
            const fileContent = fs
              .readFileSync(`${appPath}/${filePath}`)
              .toString()
              .trim();

            expect(fileContent).toMatchSnapshot(filePath);
          }
        });
      });
    });
  });
});
