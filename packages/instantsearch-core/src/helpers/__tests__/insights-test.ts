/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

describe('getUsageSessionId', () => {
  const STORAGE_KEY = 'ais.usage.sessionId';

  beforeEach(() => {
    sessionStorage.clear();
    jest.resetModules();
  });

  it('returns the same id across calls within the runtime', () => {
    const { getUsageSessionId } = require('../insights');

    const first = getUsageSessionId();
    const second = getUsageSessionId();

    expect(first).toBe(second);
    expect(first).toEqual(expect.any(String));
  });

  it('persists the id to sessionStorage and reuses it on next module load', () => {
    const { getUsageSessionId } = require('../insights');
    const original = getUsageSessionId();

    expect(sessionStorage.getItem(STORAGE_KEY)).toBe(original);

    jest.resetModules();
    const {
      getUsageSessionId: getUsageSessionIdAgain,
    } = require('../insights');

    expect(getUsageSessionIdAgain()).toBe(original);
  });

  it('falls back to an in-memory id when sessionStorage throws', () => {
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error('sessionStorage unavailable');
    };

    try {
      const { getUsageSessionId } = require('../insights');
      const first = getUsageSessionId();
      const second = getUsageSessionId();

      expect(first).toEqual(expect.any(String));
      expect(first).toBe(second);
    } finally {
      Storage.prototype.getItem = originalGetItem;
    }
  });
});
