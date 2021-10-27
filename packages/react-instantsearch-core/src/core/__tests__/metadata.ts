import algoliasearch from 'algoliasearch/lite';
import type { SearchClient } from '../../widgets/InstantSearch';
import createWidgetsManager from '../createWidgetsManager';
import { isMetadataEnabled, getMetadataPayload } from '../metadata';

const { window: originalWindow } = global;

Object.defineProperty(
  window.navigator,
  'userAgent',
  ((value) => ({
    get() {
      return value;
    },
    set(v: string) {
      value = v;
    },
  }))(window.navigator.userAgent)
);

const defaultUserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Safari/605.1.15';
const algoliaUserAgent = 'Algolia Crawler 5.3.2';

function setUserAgent(userAgent: string) {
  // casting to any, as userAgent is set as readonly by TypeScript
  (global.navigator as any).userAgent = userAgent;
}

describe('isMetadataEnabled', () => {
  afterEach(() => {
    setUserAgent(defaultUserAgent);
    global.window = originalWindow;
  });

  it('does not enable on normal user agent', () => {
    setUserAgent(defaultUserAgent);

    expect(isMetadataEnabled()).toBe(false);
  });

  it("does not enable when there's no window", () => {
    setUserAgent(algoliaUserAgent);

    // @ts-expect-error
    delete global.window;

    expect(isMetadataEnabled()).toBe(false);
  });

  it("does not enable when there's no navigator (react native)", () => {
    setUserAgent(algoliaUserAgent);

    // @ts-expect-error
    delete global.window;
    // @ts-expect-error
    global.window = {};

    expect(isMetadataEnabled()).toBe(false);
  });

  it('metadata enabled returns true', () => {
    setUserAgent(algoliaUserAgent);

    expect(isMetadataEnabled()).toBe(true);
  });
});

describe('getMetadataPayload', () => {
  describe('user agent', () => {
    test('extracts user agent from algoliasearch', () => {
      const widgetsManager = createWidgetsManager(() => {});
      const searchClient = algoliasearch(
        'appId',
        'apiKey'
      ) as unknown as SearchClient;

      const { ua } = getMetadataPayload(
        widgetsManager.getWidgets(),
        searchClient
      );

      expect(ua).toEqual(
        expect.stringMatching(
          /^Algolia for JavaScript \((\d+\.?)+\); Node\.js \((\d+\.?)+\)$/
        )
      );
    });

    test('extracts user agent from algoliasearch v3', () => {
      const widgetsManager = createWidgetsManager(() => {});
      const searchClient = {
        search() {
          return Promise.resolve({});
        },
        searchForFacetValues() {
          return Promise.resolve({});
        },
        _ua: 'v3 style user agent',
      };

      const { ua } = getMetadataPayload(
        widgetsManager.getWidgets(),
        searchClient
      );

      expect(ua).toEqual('v3 style user agent');
    });

    test('extracts nothing if absent', () => {
      const widgetsManager = createWidgetsManager(() => {});
      const searchClient = {
        search() {
          return Promise.resolve({});
        },
        searchForFacetValues() {
          return Promise.resolve({});
        },
      };

      const { ua } = getMetadataPayload(
        widgetsManager.getWidgets(),
        searchClient
      );

      expect(ua).toBe(undefined);
    });
  });

  describe('widgets', () => {
    test('detects empty widgets', () => {
      const widgetsManager = createWidgetsManager(() => {});
      const searchClient = algoliasearch(
        'appId',
        'apiKey'
      ) as unknown as SearchClient;

      const { widgets } = getMetadataPayload(
        widgetsManager.getWidgets(),
        searchClient
      );

      expect(widgets).toEqual([]);
    });
  });
});
