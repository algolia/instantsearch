'use strict';

var path = require('path');

var algoliasearch = require('algoliasearch');
algoliasearch = algoliasearch.algoliasearch || algoliasearch;

var enableIntegrationTest =
  process.env.ONLY_UNIT !== 'true' &&
  process.env.INTEGRATION_TEST_API_KEY &&
  process.env.INTEGRATION_TEST_APPID;

var include = ['test/spec/**/*.[jt]s?(x)'];
var setupFiles = [];

if (enableIntegrationTest) {
  include.push('test/integration-spec/**/*.[jt]s?(x)');
  setupFiles.push(path.resolve(__dirname, '..', 'vitest.setup.ts'));
}

async function run() {
  var { startVitest } = await import('vitest/node');
  var vitest = await startVitest('test', [], {
    root: path.resolve(__dirname, '..'),
    include: include,
    setupFiles: setupFiles,
    pool: 'forks',
    maxForks: 4,
    watch: false,
  });

  if (!vitest) {
    process.exitCode = 1;
    return;
  }

  var hasFailed = vitest.state.getFiles().some(function (f) {
    return f.result && f.result.state === 'fail';
  });

  await vitest.close();

  if (hasFailed) {
    process.exitCode = 1;
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
      if (!originalDeleteIndex) {
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
}

run();
