const algoliasearch = require('algoliasearch');

module.exports = async function getAttributesFromIndex({
  appId,
  apiKey,
  indexName,
  algoliasearchFn = algoliasearch,
} = {}) {
  const client = algoliasearchFn(appId, apiKey);
  const index = client.initIndex(indexName);
  const defaultAttributes = ['title', 'name', 'description'];
  let attributes = [];

  try {
    const { hits } = await index.search({ hitsPerPage: 1 });
    const [firstHit] = hits;
    const highlightedAttributes = Object.keys(firstHit._highlightResult);
    attributes = [
      ...new Set([
        ...defaultAttributes
          .map(
            attribute => highlightedAttributes.includes(attribute) && attribute
          )
          .filter(Boolean),
        ...highlightedAttributes,
      ]),
    ];
  } catch (err) {
    attributes = defaultAttributes;
  }

  return attributes;
};
