import historyRouter from '../history';
import type { UiState } from '../../../types';
import { noop } from '../../utils';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import instantsearch from '../../..';
import { simple } from '../../stateMappings';

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
      const router = historyRouter<UiState>();

      router.write({ indexName: { query: 'query' } });
      jest.runAllTimers();

      expect(windowPushState).toHaveBeenCalledTimes(1);
      expect(windowPushState).toHaveBeenLastCalledWith(
        { indexName: { query: 'query' } },
        '',
        'http://localhost/?indexName%5Bquery%5D=query'
      );
    });

    test('debounces history push calls', async () => {
      const windowPushState = jest.spyOn(window.history, 'pushState');
      const router = historyRouter<UiState>();

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
  });

  describe('getLocation', () => {
    test('calls getLocation on windowTitle', () => {
      const getLocation = jest.fn(() => window.location);

      historyRouter<UiState>({
        windowTitle() {
          return 'Search';
        },
        getLocation,
      });

      expect(getLocation).toHaveBeenCalledTimes(1);
    });

    test('calls getLocation on read', () => {
      const getLocation = jest.fn(() => window.location);
      const router = historyRouter<UiState>({ getLocation });

      expect(getLocation).toHaveBeenCalledTimes(0);

      router.write({ indexName: { query: 'query1' } });
      jest.runAllTimers();

      expect(getLocation).toHaveBeenCalledTimes(1);

      router.read();

      expect(getLocation).toHaveBeenCalledTimes(2);
    });

    test('calls getLocation on createURL', () => {
      const getLocation = jest.fn(() => window.location);
      const router = historyRouter<UiState>({ getLocation });

      router.createURL({ indexName: { query: 'query1' } });

      expect(getLocation).toHaveBeenCalledTimes(1);
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
        });
        const search = instantsearch({
          indexName: 'indexName',
          searchClient: createSearchClient(),
          routing: {
            stateMapping: simple(),
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
});
