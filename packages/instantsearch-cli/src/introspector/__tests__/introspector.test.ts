jest.mock('algoliasearch', () => ({
  algoliasearch: jest.fn(),
}));

import { algoliasearch } from 'algoliasearch';

import { verifyCredentials } from '../index';

const mockedAlgoliasearch = algoliasearch as unknown as jest.Mock;

function mockClientWith(
  searchImpl: (params: unknown) => Promise<unknown>
): void {
  mockedAlgoliasearch.mockImplementation(() => ({
    searchSingleIndex: searchImpl,
  }));
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
