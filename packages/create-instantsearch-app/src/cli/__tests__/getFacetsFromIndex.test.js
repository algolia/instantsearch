const getFacetsFromIndex = require('../getFacetsFromIndex');
const getInformationFromIndex = require('../getInformationFromIndex');

jest.mock('../getInformationFromIndex');

test('with search success should fetch attributes', async () => {
  getInformationFromIndex.mockImplementationOnce(() =>
    Promise.resolve({
      facets: {
        abc: {},
        def: {},
        something: {},
        'something.nested': {},
      },
    })
  );

  const attributes = await getFacetsFromIndex({
    appId: 'appId',
    apiKey: 'apiKey',
    indexName: 'indexName',
  });

  expect(attributes).toEqual(['abc', 'def', 'something', 'something.nested']);
});

test('with search failure should return default attributes', async () => {
  getInformationFromIndex.mockImplementationOnce(() =>
    Promise.reject(new Error())
  );

  const attributes = await getFacetsFromIndex({
    appId: 'appId',
    apiKey: 'apiKey',
    indexName: 'indexName',
  });

  expect(attributes).toEqual([]);
});
