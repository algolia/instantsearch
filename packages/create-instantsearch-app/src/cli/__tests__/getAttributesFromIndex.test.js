import getAttributesFromIndex from '../getAttributesFromIndex';
import getInformationFromIndex from '../getInformationFromIndex';

vi.mock('../getInformationFromIndex', () => ({
  default: vi.fn(),
}));

test('with search success should fetch attributes', async () => {
  getInformationFromIndex.mockImplementationOnce(() =>
    Promise.resolve({
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
    })
  );

  const attributes = await getAttributesFromIndex({
    appId: 'appId',
    apiKey: 'apiKey',
    indexName: 'indexName',
  });

  expect(attributes).toEqual(['title', 'name', 'description', 'brand']);
});

test('with search failure should return default attributes', async () => {
  getInformationFromIndex.mockImplementationOnce(() =>
    Promise.reject(new Error())
  );

  const attributes = await getAttributesFromIndex({
    appId: 'appId',
    apiKey: 'apiKey',
    indexName: 'indexName',
  });

  expect(attributes).toEqual(['title', 'name', 'description']);
});
