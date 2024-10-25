/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';

import {
  historyRouter,
  simpleStateMapping,
  instantsearch,
  noop,
  warnCache,
} from '../..';

import type { UiState } from '../../types';

jest.useFakeTimers();

describe('life cycle', () => {
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

  describe('getLocation', () => {
    test('calls getLocation on windowTitle', () => {
      const getLocation = jest.fn(() => window.location);

      historyRouter<UiState>({
        windowTitle() {
          return 'Search';
        },
        getLocation,
        cleanUrlOnDispose: true,
      });

      expect(getLocation).toHaveBeenCalledTimes(1);
    });

    test('calls getLocation on read', () => {
      const getLocation = jest.fn(() => window.location);
      const router = historyRouter<UiState>({
        getLocation,
        cleanUrlOnDispose: true,
      });

      expect(getLocation).toHaveBeenCalledTimes(0);

      router.write({ indexName: { query: 'query1' } });
      jest.runAllTimers();

      expect(getLocation).toHaveBeenCalledTimes(1);

      router.read();

      expect(getLocation).toHaveBeenCalledTimes(2);
    });

    test('calls getLocation on createURL', () => {
      const getLocation = jest.fn(() => window.location);
      const router = historyRouter<UiState>({
        getLocation,
        cleanUrlOnDispose: true,
      });

      router.createURL({ indexName: { query: 'query1' } });

      expect(getLocation).toHaveBeenCalledTimes(1);
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
        `"You need to provide \`getLocation\` to the \`history\` router in environments where \`window\` does not exist."`
      );
    });

    test('does not fail on environments without window with provided getLocation', () => {
      // @ts-expect-error
      delete global.window;

      expect(() => {
        const router = historyRouter<UiState>({
          getLocation() {
            return {
              protocol: '',
              hostname: '',
              port: '',
              pathname: '',
              hash: '',
              search: '',
            } as unknown as Location;
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

    test('does not fail when running the whole router lifecycle with getLocation', () => {
      // @ts-expect-error
      delete global.window;

      expect(() => {
        const router = historyRouter<UiState>({
          getLocation() {
            return {
              protocol: '',
              hostname: '',
              port: '',
              pathname: '',
              hash: '',
              search: '',
            } as unknown as Location;
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

      test('cleans refinements from URL if not defined', () => {
        const windowPushState = jest.spyOn(window.history, 'pushState');
        const router = historyRouter<UiState>();

        expect(consoleSpy)
          .toHaveBeenCalledWith(`Starting from the next major version, InstantSearch will not clean up the URL from active refinements when it is disposed.

We recommend setting \`cleanUrlOnDispose\` to false to adopt this change today.
To stay with the current behaviour and remove this warning, set the option to true.

See documentation: https://www.algolia.com/doc/api-reference/widgets/history-router/js/#widget-param-cleanurlondispose`);

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
  });
});
