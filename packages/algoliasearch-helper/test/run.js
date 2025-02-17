'use strict';

var path = require('path');

var algoliasearch = require('algoliasearch');
algoliasearch = algoliasearch.algoliasearch || algoliasearch;
var jest = require('jest');

var staticJestConfig = require('../jest.config');

var enableIntegrationTest =
  process.env.ONLY_UNIT !== 'true' &&
  process.env.INTEGRATION_TEST_API_KEY &&
  process.env.INTEGRATION_TEST_APPID;

var projectsRootPaths = [path.resolve(__dirname, '..')];
var dynamicJestConfig = Object.assign({}, staticJestConfig, {
  maxWorkers: 4,
  setupFilesAfterEnv: staticJestConfig.setupFilesAfterEnv || [],
});

if (enableIntegrationTest) {
  dynamicJestConfig.testMatch.push(
    '<rootDir>/test/integration-spec/**/*.[jt]s?(x)'
  );
  dynamicJestConfig.setupFilesAfterEnv.push(
    path.resolve(__dirname, '..', 'jest.setup.js')
  );
}

jest.runCLI(dynamicJestConfig, projectsRootPaths).then(function (response) {
  if (!response.results.success) {
    process.exitCode = response.globalConfig.testFailureExitCode;
  }

  if (enableIntegrationTest) {
    var client = algoliasearch(
      process.env.INTEGRATION_TEST_APPID,
      process.env.INTEGRATION_TEST_API_KEY
    );
    var originalDeleteIndex = client.deleteIndex
      ? client.deleteIndex.bind(client)
      : undefined;
    client.deleteIndex = function (deleteIndexName) {
      if (!client.deleteIndex) {
        return client.initIndex(deleteIndexName).delete();
      }
      if (!client.initIndex) {
        return originalDeleteIndex({ indexName: deleteIndexName });
      }
      return originalDeleteIndex(deleteIndexName);
    };
    client.listIndexes = client.listIndexes || client.listIndices;

    client.listIndexes().then((content) => {
      content.items
        .map((i) => i.name)
        .filter((n) => n.indexOf('_circle-algoliasearch-helper') !== -1)
        .forEach((n) => client.deleteIndex(n));
    });
  }
});
