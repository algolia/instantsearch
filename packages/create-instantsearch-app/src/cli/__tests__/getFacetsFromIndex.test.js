import getFacetsFromIndex from '../getFacetsFromIndex';
import getInformationFromIndex from '../getInformationFromIndex';

vi.mock('../getInformationFromIndex', () => ({
  default: vi.fn(),
}));

test('with search success should fetch attributes', async () => {
  getInformationFromIndex.mockImplementationOnce(() =>
    Promise.resolve({
      facets: {
        abc: { a: 1, b: 2 },
        def: { a: 1, b: 2 },
        something: { a: 1, b: 2 },
        other: { a: 1, b: 2 },
      },
    })
  );

  const facets = await getFacetsFromIndex({
    appId: 'appId',
    apiKey: 'apiKey',
    indexName: 'indexName',
  });

  expect(facets).toEqual(['abc', 'def', 'something', 'other']);
});

test('with search failure should return default attributes', async () => {
  getInformationFromIndex.mockImplementationOnce(() =>
    Promise.reject(new Error())
  );

  const facets = await getFacetsFromIndex({
    appId: 'appId',
    apiKey: 'apiKey',
    indexName: 'indexName',
  });

  expect(facets).toEqual([]);
});
