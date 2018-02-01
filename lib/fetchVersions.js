const algoliasearch = require('algoliasearch');

const algoliaConfig = {
  appId: 'OFCNCOG2CU',
  apiKey: 'f54e21fa3a2a0160595bb058179bfb1e',
  indexName: 'npm-search',
};

const client = algoliasearch(algoliaConfig.appId, algoliaConfig.apiKey);
const index = client.initIndex(algoliaConfig.indexName);

const fetchLatestVersion = async () => {
  let libVersion;

  try {
    const library = await index.getObject('instantsearch.js');
    libVersion = library.version;
  } catch (err) {
    // `AlgoliaSearchNetworkError` can occur if offline.
    // Defaults to the latest major version.
    libVersion = '2';

    console.warn(
      "⚠️ We couldn't fetch the latest instantsearch.js version as you seem to be offline.\n" +
        'instantsearch.js@2 has been added to your project.\n' +
        "Make sure to explicitely set the latest version when you're back online: https://yarnpkg.com/en/package/instantsearch.js"
    );
  }

  return libVersion;
};

module.exports = {
  fetchLatestVersion,
};
