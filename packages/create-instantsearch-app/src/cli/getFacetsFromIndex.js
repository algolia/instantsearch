import getInformationFromIndex from './getInformationFromIndex.js';

export default async function getFacetsFromIndex({
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
}
