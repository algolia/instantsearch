const getInformationFromIndex = require('./getInformationFromIndex');

module.exports = async function getPotentialImageAttributes({
  appId,
  apiKey,
  indexName,
} = {}) {
  try {
    const { hits } = await getInformationFromIndex({
      appId,
      apiKey,
      indexName,
    });
    const [firstHit] = hits;
    const highlightedAttributes = Object.keys(firstHit._highlightResult);
    return Object.entries(firstHit)
      .filter(
        ([key, value]) =>
          typeof value === 'string' &&
          !/[\s]+/.test(value) &&
          !highlightedAttributes.includes(key) &&
          key !== 'objectID'
      )
      .map(([key]) => key)
      .sort((a, b) => {
        const regex = /image|img/;
        const aIncludesImage = regex.test(a);
        const bIncludesImage = regex.test(b);

        if (aIncludesImage && !bIncludesImage) {
          return -1;
        }

        if (!aIncludesImage && bIncludesImage) {
          return 1;
        }

        return 0;
      });
  } catch (err) {
    return [];
  }
};
