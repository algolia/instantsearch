import algoliasearch from 'algoliasearch';

export default async function cleanup() {
  const enableIntegrationTest =
    process.env.ONLY_UNIT !== 'true' &&
    process.env.INTEGRATION_TEST_API_KEY &&
    process.env.INTEGRATION_TEST_APPID;

  if (enableIntegrationTest) {
    // eslint-disable-next-line no-console
    console.log('Cleaning up integration tests');

    const client = algoliasearch(
      process.env.INTEGRATION_TEST_APPID!,
      process.env.INTEGRATION_TEST_API_KEY!
    );

    const deleteIndex = function deleteIndex(indexName: string) {
      if ((client as any).deleteIndex)
        return (client as any).deleteIndex(indexName);
      return client.initIndex(indexName).delete();
    };

    (client as any).listIndices =
      client.listIndices || (client as any).listIndexes;

    await client.listIndices().then((content) => {
      content.items
        .map((i) => i.name)
        .filter((n) => n.indexOf('_circle-algoliasearch-helper') !== -1)
        .forEach((n) => deleteIndex(n));
    });
  }
}
