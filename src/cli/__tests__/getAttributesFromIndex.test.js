const algoliasearch = require('algoliasearch');
const getAttributesFromIndex = require('../getAttributesFromIndex');

jest.mock('algoliasearch');

test('with search success should fetch attributes', async () => {
  algoliasearch.mockImplementationOnce(() => ({
    initIndex: () => ({
      search: () => ({
        hits: [
          {
            _highlightResult: {
              brand: 'brand',
              description: 'description',
              name: 'name',
              title: 'title',
            },
          },
        ],
      }),
    }),
  }));

  const attributes = await getAttributesFromIndex({
    appId: 'appId',
    apiKey: 'apiKey',
    indexName: 'indexName',
  });

  expect(attributes).toEqual(['title', 'name', 'description', 'brand']);
});

test('with search failure should return default attributes', async () => {
  algoliasearch.mockImplementationOnce(() => ({
    initIndex: () => ({
      search: () => {
        throw new Error();
      },
    }),
  }));

  const attributes = await getAttributesFromIndex({
    appId: 'appId',
    apiKey: 'apiKey',
    indexName: 'indexName',
  });

  expect(attributes).toEqual(['title', 'name', 'description']);
});
