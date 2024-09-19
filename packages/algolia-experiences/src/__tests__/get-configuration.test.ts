import { fetchConfiguration } from '../get-configuration';

describe('fetchConfiguration', () => {
  it('should fetch and cache the configuration', async () => {
    const settings = { appId: 'appId', apiKey: 'apiKey' };

    // @ts-ignore
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: '1',
            name: 'name',
            indexName: 'indexName',
            blocks: [],
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
          }),
      })
    );

    await fetchConfiguration('1', settings);

    expect(global.fetch).toHaveBeenCalledTimes(1);

    await fetchConfiguration('1', settings);

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
