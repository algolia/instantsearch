const getAttributesFromIndex = require('../getAttributesFromIndex');

const algoliasearchSuccessFn = () => ({
  initIndex: () => ({
    search: jest.fn(() => ({
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
    })),
  }),
});

const algoliasearchFailureFn = () => ({
  initIndex: () => ({
    search: jest.fn(() => {
      throw new Error();
    }),
  }),
});

test('with search success should fetch attributes', async () => {
  const attributes = await getAttributesFromIndex({
    appId: 'appId',
    apiKey: 'apiKey',
    indexName: 'indexName',
    algoliasearchFn: algoliasearchSuccessFn,
  });

  expect(attributes).toEqual(['title', 'name', 'description', 'brand']);
});

test('with search failure should return default attributes', async () => {
  const attributes = await getAttributesFromIndex({
    appId: 'appId',
    apiKey: 'apiKey',
    indexName: 'indexName',
    algoliasearchFn: algoliasearchFailureFn,
  });

  expect(attributes).toEqual(['title', 'name', 'description']);
});
