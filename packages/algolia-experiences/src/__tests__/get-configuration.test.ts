import { API_BASE, fetchConfiguration } from '../get-configuration';

describe('fetchConfiguration', () => {
  it('should fetch and cache the configuration', async () => {
    const settings = {
      appId: 'appId',
      apiKey: 'apiKey',
      environment: 'prod' as const,
    };

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

  it('should fetch from the relevant environment', async () => {
    const settings = {
      appId: 'appId',
      apiKey: 'apiKey',
      environment: 'beta' as const,
    };

    // @ts-ignore
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: '2',
            name: 'name',
            indexName: 'indexName',
            blocks: [],
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
          }),
      })
    );

    await fetchConfiguration('2', settings);
    expect(global.fetch).toHaveBeenLastCalledWith(
      `${API_BASE.beta}/experiences/2`,
      expect.anything()
    );
  });
});
