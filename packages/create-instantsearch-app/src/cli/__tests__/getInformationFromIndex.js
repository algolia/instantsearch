const { algoliasearch } = require('algoliasearch');

const getInformationFromIndex = require('../getInformationFromIndex');

jest.mock('algoliasearch', () => {
  const _algoliasearch = jest.fn(() => ({ search: _algoliasearch.__search }));
  _algoliasearch.__search = jest.fn(() =>
    Promise.resolve({
      results: [
        {
          hits: [],
          facets: {},
        },
      ],
    })
  );

  return { algoliasearch: _algoliasearch };
});

test('returns default information', async () => {
  const info = await getInformationFromIndex({
    appId: 'a',
    apiKey: 'a',
    indexName: 'a',
  });

  expect(info).toEqual({ hits: [], facets: {} });
});

test('returns {} on error', async () => {
  algoliasearch.__search.mockImplementationOnce(() =>
    Promise.reject(new Error())
  );

  const info = await getInformationFromIndex({
    appId: 'a',
    apiKey: 'a',
    indexName: 'a',
  });

  expect(info).toEqual({});
});

test('creates client once per credentials', async () => {
  await getInformationFromIndex({
    appId: 'a',
    apiKey: 'a',
    indexName: 'a',
  });

  expect(algoliasearch).toHaveBeenCalledTimes(1);

  await getInformationFromIndex({
    appId: 'b',
    apiKey: 'b',
    indexName: 'b',
  });

  expect(algoliasearch).toHaveBeenCalledTimes(2);

  await getInformationFromIndex({
    appId: 'b',
    apiKey: 'b',
    indexName: 'c',
  });

  expect(algoliasearch).toHaveBeenCalledTimes(2);
});
