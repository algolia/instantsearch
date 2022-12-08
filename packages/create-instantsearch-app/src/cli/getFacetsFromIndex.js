const getInformationFromIndex = require('./getInformationFromIndex');

module.exports = async function getFacetsFromIndex({
  appId,
  apiKey,
  indexName,
} = {}) {
  try {
    const { facets } = await getInformationFromIndex({
      appId,
      apiKey,
      indexName,
    });
    return Object.keys(facets);
  } catch (err) {
    return [];
  }
};
