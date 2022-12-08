const getInformationFromIndex = require('./getInformationFromIndex');

module.exports = async function getAttributesFromIndex({
  appId,
  apiKey,
  indexName,
} = {}) {
  const defaultAttributes = ['title', 'name', 'description'];
  let attributes = [];

  try {
    const { hits } = await getInformationFromIndex({
      appId,
      apiKey,
      indexName,
    });
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
