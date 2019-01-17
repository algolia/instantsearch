const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const walkSync = require('walk-sync');
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { getEarliestLibraryVersion } = require('../src/utils');

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

    describe(`${templateName}`, () => {
      let temporaryDirectory;
      let appPath;
      let configFilePath;
      let generatedFiles;

      beforeAll(async () => {
        temporaryDirectory = execSync(
          'mktemp -d 2>/dev/null || mktemp -d -t "appPath"'
        )
          .toString()
          .trim();

        appPath = `${temporaryDirectory}/${templateConfig.appName}`;

        const config = {
          name: templateConfig.appName,
          template: templateName,
          // We fetch the earliest supported version in order to not change
          // the test output everytime we release a new version of a library.
          libraryVersion: await getEarliestLibraryVersion({
            libraryName: templateConfig.libraryName,
            supportedVersion: templateConfig.supportedVersion,
          }),
          appId: 'appId',
          apiKey: 'apiKey',
          indexName: 'indexName',
          searchPlaceholder: 'Search placeholder',
          attributesToDisplay: ['attribute1', 'attribute2'],
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
        generatedFiles
          .filter(filePath => !['.jar'].includes(filePath.slice(-4)))
          .forEach(filePath => {
            if (['.png', '.ico', '.jpg'].includes(filePath.slice(-4))) {
              const image = fs.readFileSync(`${templatePath}/${filePath}`);

              expect(image).toMatchImageSnapshot({
                customSnapshotsDir: path.resolve(
                  `./scripts/__image_snapshots__/${
                    templateConfig.templateName
                  }/${path.dirname(filePath)}`
                ),
                customSnapshotIdentifier: path.basename(filePath),
              });
            } else {
              const fileContent = fs
                .readFileSync(`${appPath}/${filePath}`)
                .toString()
                .trim();

              if (path.basename(filePath) === 'package.json') {
                // Only snapshot partial dependencies for Renovate to update
                // dependencies without the CI failing.
                // See: https://github.com/algolia/create-instantsearch-app/issues/110
                const {
                  dependencies = {},
                  devDependencies = {}, // eslint-disable-line no-unused-vars
                  ...packageRest
                } = JSON.parse(fileContent);
                const { libraryName } = templateConfig;
                const packageContent = {
                  ...packageRest,
                  partialDependencies: libraryName
                    ? {
                        [libraryName]: dependencies[libraryName],
                      }
                    : {},
                };

                expect(JSON.stringify(packageContent, null, 2)).toMatchSnapshot(
                  filePath
                );
              } else {
                expect(fileContent).toMatchSnapshot(filePath);
              }
            }
          });
      });
    });
  });
});
