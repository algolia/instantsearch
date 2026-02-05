/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';

import {
  historyRouter,
  simpleStateMapping,
  instantsearch,
  noop,
  warnCache,
  connectSearchBox,
} from '../..';

import type { IndexUiState, UiState } from '../../types';

jest.useFakeTimers();

describe('historyRouter', () => {
  const originalWindow = (global as any).window;

  beforeEach(() => {
    window.history.pushState(null, '-- divider --', 'http://localhost/');
    jest.restoreAllMocks();
  });

  afterEach(() => {
    (global as any).window = originalWindow;
  });

  describe('pushState', () => {
    test('calls pushState on write', () => {
      const windowPushState = jest.spyOn(window.history, 'pushState');
      const router = historyRouter<UiState>({ cleanUrlOnDispose: true });

      router.write({ indexName: { query: 'query' } });
      jest.runAllTimers();

      expect(windowPushState).toHaveBeenCalledTimes(1);
      expect(windowPushState).toHaveBeenLastCalledWith(
        { indexName: { query: 'query' } },
        '',
        'http://localhost/?indexName%5Bquery%5D=query'
      );
    });

    test('debounces history push calls', () => {
      const windowPushState = jest.spyOn(window.history, 'pushState');
      const router = historyRouter<UiState>({ cleanUrlOnDispose: true });

      router.write({ indexName: { query: 'query1' } });
      router.write({ indexName: { query: 'query2' } });
      router.write({ indexName: { query: 'query3' } });
      jest.runAllTimers();

      expect(windowPushState).toHaveBeenCalledTimes(1);
      expect(windowPushState).toHaveBeenLastCalledWith(
        { indexName: { query: 'query3' } },
        '',
        'http://localhost/?indexName%5Bquery%5D=query3'
      );
    });

    test('calls user-provided push if set', () => {
      const windowPushState = jest.spyOn(window.history, 'pushState');
      const customPush = jest.fn();
      const router = historyRouter<UiState>({
        push: customPush,
        cleanUrlOnDispose: true,
      });

      router.write({ indexName: { query: 'query' } });
      jest.runAllTimers();

      expect(windowPushState).toHaveBeenCalledTimes(0);
      expect(customPush).toHaveBeenCalledTimes(1);
      expect(customPush).toHaveBeenLastCalledWith(
        'http://localhost/?indexName%5Bquery%5D=query'
      );
    });
  });

  describe('getCurrentURL', () => {
    test('calls getCurrentURL on load', () => {
      const getCurrentURL = jest.fn(() => new URL(window.location.href));

      historyRouter<UiState>({
        windowTitle() {
          return 'Search';
        },
        getCurrentURL,
        cleanUrlOnDispose: true,
      });

      expect(getCurrentURL).toHaveBeenCalledTimes(1);
    });

    test('calls getCurrentURL on read', () => {
      const getCurrentURL = jest.fn(() => new URL(window.location.href));
      const router = historyRouter<UiState>({
        getCurrentURL,
        cleanUrlOnDispose: true,
      });

      expect(getCurrentURL).toHaveBeenCalledTimes(0);

      router.write({ indexName: { query: 'query1' } });
      jest.runAllTimers();

      expect(getCurrentURL).toHaveBeenCalledTimes(1);

      router.read();

      expect(getCurrentURL).toHaveBeenCalledTimes(2);
    });

    test('calls getCurrentURL on createURL', () => {
      const getCurrentURL = jest.fn(() => new URL(window.location.href));
      const router = historyRouter<UiState>({
        getCurrentURL,
        cleanUrlOnDispose: true,
      });

      router.createURL({ indexName: { query: 'query1' } });

      expect(getCurrentURL).toHaveBeenCalledTimes(1);
    });
  });

  describe('pop state', () => {
    test('skips history push on browser back/forward actions', () => {
      const pushState = jest.spyOn(window.history, 'pushState');
      const router = historyRouter<UiState>({ cleanUrlOnDispose: true });
      router.onUpdate((routeState) => {
        router.write(routeState);
      });

      router.write({ indexName: { page: 1 } });
      jest.runAllTimers();

      // The regular write pushes in the history
      expect(pushState).toHaveBeenCalledTimes(1);

      const popStateEvent = new PopStateEvent('popstate', {
        state: { indexName: { page: 2 } },
      });
      window.dispatchEvent(popStateEvent);
      jest.runAllTimers();

      // The pop state event skips the push in the history
      expect(pushState).toHaveBeenCalledTimes(1);

      // The regular write pushes in the history
      router.write({ indexName: { page: 3 } });
      jest.runAllTimers();

      expect(pushState).toHaveBeenCalledTimes(2);
    });

    test("doesn't throw if an index history state is null", () => {
      const router = historyRouter<UiState>({ cleanUrlOnDispose: true });
      const stateMapping = simpleStateMapping();

      router.onUpdate((routeState) => {
        const state = stateMapping.routeToState(routeState);
        expect(state).toEqual({});
      });

      const popStateEvent = new PopStateEvent('popstate', {
        state: { indexName: null },
      });
      window.dispatchEvent(popStateEvent);
      jest.runAllTimers();
    });
  });

  describe('environment', () => {
    test('throws on environments without window by default', () => {
      // @ts-expect-error
      delete global.window;

      expect(() => {
        const search = instantsearch({
          indexName: 'indexName',
          searchClient: createSearchClient(),
          routing: true,
        });
        search.start();
        jest.runAllTimers();
      }).toThrowErrorMatchingInlineSnapshot(
        `"You need to provide \`getCurrentURL\` to the \`history\` router in environments where \`window\` does not exist."`
      );
    });

    test('does not fail on environments without window with provided getCurrentURL', () => {
      // @ts-expect-error
      delete global.window;

      expect(() => {
        const router = historyRouter<UiState>({
          getCurrentURL() {
            return new URL('http://localhost/');
          },
          cleanUrlOnDispose: true,
        });
        const search = instantsearch({
          indexName: 'indexName',
          searchClient: createSearchClient(),
          routing: {
            stateMapping: simpleStateMapping(),
            router,
          },
        });

        search.start();
        jest.runAllTimers();
      }).not.toThrow();
    });

    test('does not fail when running the whole router lifecycle with getCurrentURL', () => {
      // @ts-expect-error
      delete global.window;

      expect(() => {
        const router = historyRouter<UiState>({
          getCurrentURL() {
            return new URL('http://localhost/');
          },
          cleanUrlOnDispose: true,
        });

        // We run the whole lifecycle to make sure none of the steps access `window`.
        router.read();
        router.write({ indexName: { query: 'query1' } });
        jest.runAllTimers();
        router.read();
        router.onUpdate(noop);
        router.dispose();
        router.createURL({ indexName: { query: 'query1' } });
      }).not.toThrow();
    });
  });

  describe('onUpdate', () => {
    test('calls user-provided start function', () => {
      const start = jest.fn();
      const router = historyRouter<UiState>({
        start,
        cleanUrlOnDispose: true,
      });

      router.onUpdate(jest.fn());

      expect(start).toHaveBeenCalledTimes(1);
    });
  });

  describe('dispose', () => {
    test('calls user-provided dispose function', () => {
      const dispose = jest.fn();
      const router = historyRouter<UiState>({
        dispose,
        cleanUrlOnDispose: true,
      });

      router.dispose();

      expect(dispose).toHaveBeenCalledTimes(1);
    });

    describe('cleanUrlOnDispose', () => {
      const consoleSpy = jest.spyOn(global.console, 'info');
      consoleSpy.mockImplementation(() => {});

      beforeEach(() => {
        consoleSpy.mockReset();
      });

      test('does not clean refinements from URL if not defined', () => {
        const windowPushState = jest.spyOn(window.history, 'pushState');
        const router = historyRouter<UiState>();

        router.write({ indexName: { query: 'query1' } });
        jest.runAllTimers();

        expect(windowPushState).toHaveBeenCalledTimes(1);
        expect(windowPushState).toHaveBeenLastCalledWith(
          {
            indexName: { query: 'query1' },
          },
          '',
          'http://localhost/?indexName%5Bquery%5D=query1'
        );

        router.dispose();
        jest.runAllTimers();

        expect(windowPushState).toHaveBeenCalledTimes(1);
      });

      test('cleans refinements from URL if `true`', () => {
        const windowPushState = jest.spyOn(window.history, 'pushState');
        const router = historyRouter<UiState>({ cleanUrlOnDispose: true });

        expect(consoleSpy).not.toHaveBeenCalled();

        router.write({ indexName: { query: 'query1' } });
        jest.runAllTimers();

        expect(windowPushState).toHaveBeenCalledTimes(1);
        expect(windowPushState).toHaveBeenLastCalledWith(
          {
            indexName: { query: 'query1' },
          },
          '',
          'http://localhost/?indexName%5Bquery%5D=query1'
        );

        router.dispose();
        jest.runAllTimers();

        expect(windowPushState).toHaveBeenCalledTimes(2);
        expect(windowPushState).toHaveBeenLastCalledWith(
          {},
          '',
          'http://localhost/'
        );
      });

      test('does not clean refinements from URL if `false`', () => {
        const windowPushState = jest.spyOn(window.history, 'pushState');
        const router = historyRouter<UiState>({ cleanUrlOnDispose: false });

        expect(consoleSpy).not.toHaveBeenCalled();

        router.write({ indexName: { query: 'query1' } });
        jest.runAllTimers();

        expect(windowPushState).toHaveBeenCalledTimes(1);
        expect(windowPushState).toHaveBeenLastCalledWith(
          {
            indexName: { query: 'query1' },
          },
          '',
          'http://localhost/?indexName%5Bquery%5D=query1'
        );

        router.dispose();
        jest.runAllTimers();

        expect(windowPushState).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('createURL', () => {
    test('prints a warning when created URL is not valid', () => {
      warnCache.current = {};

      const router = historyRouter<UiState>({
        createURL: () => '/search',
        cleanUrlOnDispose: true,
      });

      expect(() => router.createURL({ indexName: {} }))
        .toWarnDev(`[InstantSearch]: The URL returned by the \`createURL\` function is invalid.
Please make sure it returns an absolute URL to avoid issues, e.g: \`https://algolia.com/search?query=iphone\`.`);
    });

    it('returns an URL for a `routeState` with refinements', () => {
      const router = historyRouter<IndexUiState>();
      const actual = router.createURL({
        query: 'iPhone',
        page: 5,
      });

      expect(actual).toBe('http://localhost/?query=iPhone&page=5');
    });

    it('returns an URL for an empty `routeState` with index', () => {
      const router = historyRouter();
      const actual = router.createURL({
        indexName: {},
      });

      expect(actual).toBe('http://localhost/');
    });

    it('returns an URL for an empty `routeState`', () => {
      const router = historyRouter();
      const actual = router.createURL({});

      expect(actual).toBe('http://localhost/');
    });
  });

  describe('read', () => {
    const createFakeUrlWithRefinements: ({
      length,
    }: {
      length: number;
    }) => string = ({ length }) =>
      `http://localhost/?${Array.from(
        { length },
        (_v, i) => `refinementList[brand][${i}]=brand-${i}`
      ).join('&')}`;

    test('should parse refinements with more than 20 filters per category as array', () => {
      history.pushState({}, '', createFakeUrlWithRefinements({ length: 22 }));

      const router = historyRouter<IndexUiState>();
      const parsedUrl = router.read();

      expect(parsedUrl.refinementList!.brand).toBeInstanceOf(Array);
      expect(parsedUrl.refinementList!.brand).toHaveLength(22);
      expect(parsedUrl).toMatchInlineSnapshot(`
        {
          "refinementList": {
            "brand": [
              "brand-0",
              "brand-1",
              "brand-2",
              "brand-3",
              "brand-4",
              "brand-5",
              "brand-6",
              "brand-7",
              "brand-8",
              "brand-9",
              "brand-10",
              "brand-11",
              "brand-12",
              "brand-13",
              "brand-14",
              "brand-15",
              "brand-16",
              "brand-17",
              "brand-18",
              "brand-19",
              "brand-20",
              "brand-21",
            ],
          },
        }
      `);
    });

    test('should support returning 100 refinements as array', () => {
      history.pushState({}, '', createFakeUrlWithRefinements({ length: 100 }));

      const router = historyRouter<IndexUiState>();
      const parsedUrl = router.read();

      expect(parsedUrl.refinementList!.brand).toBeInstanceOf(Array);
      expect(parsedUrl.refinementList!.brand).toHaveLength(100);
    });
  });

  describe('windowTitle', () => {
    test('should update the window title with URL query params on first render', () => {
      history.pushState({}, '', 'http://localhost/?query=query');

      const setWindowTitle = jest.spyOn(window.document, 'title', 'set');
      const searchClient = createSearchClient();
      const router = historyRouter({
        windowTitle(routeState) {
          return `Searching for "${routeState.query}"`;
        },
      });

      const search = instantsearch({
        indexName: 'instant_search',
        searchClient,
        routing: {
          router,
        },
      });

      const fakeSearchBox = connectSearchBox(() => {})({});

      search.addWidgets([fakeSearchBox]);
      search.start();

      expect(true).toBe(true);

      expect(setWindowTitle).toHaveBeenCalledTimes(1);
      expect(setWindowTitle).toHaveBeenLastCalledWith('Searching for "query"');

      setWindowTitle.mockRestore();
    });
  });
});
