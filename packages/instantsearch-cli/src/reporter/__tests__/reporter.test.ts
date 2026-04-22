import { success, failure, API_VERSION } from '../index';

describe('reporter', () => {
  test('success wraps a payload with apiVersion, ok: true, and the given command', () => {
    const report = success({
      command: 'init',
      payload: { manifestPath: 'instantsearch.json' },
    });

    expect(report).toEqual({
      apiVersion: 1,
      ok: true,
      command: 'init',
      manifestPath: 'instantsearch.json',
    });
  });

  test('failure wraps an error with apiVersion, ok: false, code, message', () => {
    const report = failure({
      command: 'init',
      code: 'credentials_invalid',
      message: 'Algolia rejected the app ID / search API key pair.',
    });

    expect(report).toEqual({
      apiVersion: 1,
      ok: false,
      command: 'init',
      code: 'credentials_invalid',
      message: 'Algolia rejected the app ID / search API key pair.',
    });
  });

  test('API_VERSION is 1', () => {
    expect(API_VERSION).toBe(1);
  });
});
