jest.mock('algoliasearch', () => ({
  algoliasearch: jest.fn(),
}));

import { algoliasearch } from 'algoliasearch';

import {
  introspectFacets,
  introspectRecords,
  introspectReplicas,
  verifyCredentials,
} from '../index';

const mockedAlgoliasearch = algoliasearch as unknown as jest.Mock;

function mockClientWith(
  searchImpl: (params: unknown) => Promise<unknown>,
  extra: Record<string, unknown> = {}
): void {
  mockedAlgoliasearch.mockImplementation(() => ({
    searchSingleIndex: searchImpl,
    ...extra,
  }));
}

function algoliaError(status: number, message = 'Algolia error'): Error {
  return Object.assign(new Error(message), { status });
}

beforeEach(() => {
  mockedAlgoliasearch.mockReset();
});

describe('introspector.verifyCredentials', () => {
  test('returns ok when Algolia accepts the probe search', async () => {
    mockClientWith(() => Promise.resolve({ hits: [] }));

    const result = await verifyCredentials({
      appId: 'APP',
      searchApiKey: 'KEY',
    });

    expect(result).toEqual({ ok: true });
  });

  test('returns ok when the probe index does not exist (404) — creds were accepted', async () => {
    mockClientWith(() => {
      const error = Object.assign(new Error('Index does not exist'), {
        status: 404,
      });
      return Promise.reject(error);
    });

    const result = await verifyCredentials({
      appId: 'APP',
      searchApiKey: 'KEY',
    });

    expect(result).toEqual({ ok: true });
  });

  test('returns credentials_invalid on 403 (invalid key)', async () => {
    mockClientWith(() => {
      const error = Object.assign(new Error('Invalid API key'), {
        status: 403,
      });
      return Promise.reject(error);
    });

    const result = await verifyCredentials({
      appId: 'APP',
      searchApiKey: 'BAD',
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('credentials_invalid');
    expect(result.message).toMatch(/app id|search api key|credential/i);
  });

  test('returns credentials_invalid on 401 (unrecognized application)', async () => {
    mockClientWith(() => {
      const error = Object.assign(new Error('Unknown app'), { status: 401 });
      return Promise.reject(error);
    });

    const result = await verifyCredentials({
      appId: 'NOPE',
      searchApiKey: 'KEY',
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('credentials_invalid');
  });
});

describe('introspector.introspectRecords', () => {
  test('returns attributes (highlighted keys) and image candidates (non-highlighted string fields, image-likely first)', async () => {
    mockClientWith(() =>
      Promise.resolve({
        hits: [
          {
            objectID: 'abc',
            name: 'Widget',
            description: 'Nice product',
            image_url: 'https://cdn/widget.jpg',
            sku: 'WGT-1',
            _highlightResult: {
              name: { value: 'Widget' },
              description: { value: 'Nice product' },
            },
          },
        ],
      })
    );

    const result = await introspectRecords({
      appId: 'APP',
      searchApiKey: 'KEY',
      indexName: 'products',
    });

    if (!result.ok) throw new Error('expected success');
    expect(result.attributes).toEqual(
      expect.arrayContaining(['name', 'description'])
    );
    // image_url sorts before sku because its name matches the image heuristic
    expect(result.imageCandidates[0]).toBe('image_url');
    expect(result.imageCandidates).toContain('sku');
  });

  test('returns index_empty when the index has no records', async () => {
    mockClientWith(() => Promise.resolve({ hits: [] }));

    const result = await introspectRecords({
      appId: 'APP',
      searchApiKey: 'KEY',
      indexName: 'products',
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('index_empty');
  });

  test('returns index_not_found on 404', async () => {
    mockClientWith(() => Promise.reject(algoliaError(404, 'Index does not exist')));

    const result = await introspectRecords({
      appId: 'APP',
      searchApiKey: 'KEY',
      indexName: 'missing',
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('index_not_found');
  });

  test('returns credentials_invalid on 403', async () => {
    mockClientWith(() => Promise.reject(algoliaError(403, 'forbidden')));

    const result = await introspectRecords({
      appId: 'APP',
      searchApiKey: 'BAD',
      indexName: 'products',
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('credentials_invalid');
  });

  test('retries once on transient network error, then succeeds', async () => {
    let calls = 0;
    mockClientWith(() => {
      calls += 1;
      if (calls === 1) {
        return Promise.reject(new Error('ECONNRESET'));
      }
      return Promise.resolve({
        hits: [{ objectID: 'x', _highlightResult: { title: { value: 'x' } } }],
      });
    });

    const result = await introspectRecords({
      appId: 'APP',
      searchApiKey: 'KEY',
      indexName: 'products',
    });

    expect(result.ok).toBe(true);
    expect(calls).toBe(2);
  });

  test('returns network_error after two failed attempts', async () => {
    let calls = 0;
    mockClientWith(() => {
      calls += 1;
      return Promise.reject(new Error('ECONNRESET'));
    });

    const result = await introspectRecords({
      appId: 'APP',
      searchApiKey: 'KEY',
      indexName: 'products',
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('network_error');
    expect(calls).toBe(2);
  });
});

describe('introspector.introspectFacets', () => {
  test('returns facet keys from the search response', async () => {
    mockClientWith(() =>
      Promise.resolve({
        hits: [{ objectID: 'x' }],
        facets: { brand: { Apple: 10 }, category: { Phones: 5 } },
      })
    );

    const result = await introspectFacets({
      appId: 'APP',
      searchApiKey: 'KEY',
      indexName: 'products',
    });

    if (!result.ok) throw new Error('expected success');
    expect(result.facets).toEqual(expect.arrayContaining(['brand', 'category']));
  });

  test('returns index_has_no_facets when no facets are configured', async () => {
    mockClientWith(() =>
      Promise.resolve({ hits: [{ objectID: 'x' }], facets: {} })
    );

    const result = await introspectFacets({
      appId: 'APP',
      searchApiKey: 'KEY',
      indexName: 'products',
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('index_has_no_facets');
  });

  test('returns credentials_invalid on 403', async () => {
    mockClientWith(() => Promise.reject(algoliaError(403)));

    const result = await introspectFacets({
      appId: 'APP',
      searchApiKey: 'BAD',
      indexName: 'products',
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('credentials_invalid');
  });

  test('returns index_not_found on 404', async () => {
    mockClientWith(() => Promise.reject(algoliaError(404)));

    const result = await introspectFacets({
      appId: 'APP',
      searchApiKey: 'KEY',
      indexName: 'missing',
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('index_not_found');
  });
});

describe('introspector.introspectReplicas', () => {
  function mockSettingsWith(
    getSettingsImpl: (params: unknown) => Promise<unknown>
  ): void {
    mockedAlgoliasearch.mockImplementation(() => ({
      getSettings: getSettingsImpl,
    }));
  }

  test('returns replicas from getSettings', async () => {
    mockSettingsWith(() =>
      Promise.resolve({ replicas: ['products_price_asc', 'products_price_desc'] })
    );

    const result = await introspectReplicas({
      appId: 'APP',
      searchApiKey: 'KEY',
      indexName: 'products',
    });

    if (!result.ok) throw new Error('expected success');
    expect(result.replicas).toEqual([
      'products_price_asc',
      'products_price_desc',
    ]);
  });

  test('returns no_replicas when replicas field is absent', async () => {
    mockSettingsWith(() => Promise.resolve({}));

    const result = await introspectReplicas({
      appId: 'APP',
      searchApiKey: 'KEY',
      indexName: 'products',
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('no_replicas');
  });

  test('returns no_replicas when replicas is an empty list', async () => {
    mockSettingsWith(() => Promise.resolve({ replicas: [] }));

    const result = await introspectReplicas({
      appId: 'APP',
      searchApiKey: 'KEY',
      indexName: 'products',
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('no_replicas');
  });

  test('returns settings_forbidden on 403 (restricted key)', async () => {
    mockSettingsWith(() => Promise.reject(algoliaError(403)));

    const result = await introspectReplicas({
      appId: 'APP',
      searchApiKey: 'RESTRICTED',
      indexName: 'products',
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('settings_forbidden');
  });

  test('returns index_not_found on 404', async () => {
    mockSettingsWith(() => Promise.reject(algoliaError(404)));

    const result = await introspectReplicas({
      appId: 'APP',
      searchApiKey: 'KEY',
      indexName: 'missing',
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('expected failure');
    expect(result.code).toBe('index_not_found');
  });
});
