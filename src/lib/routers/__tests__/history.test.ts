import historyRouter from '../history';
import { wait } from '../../../../test/utils/wait';
import type { UiState } from '../../../types';
import { noop } from '../../utils';

describe('life cycle', () => {
  const originalWindow = (global as any).window;

  beforeEach(() => {
    window.history.pushState(null, '-- divider --', 'http://localhost/');
    jest.restoreAllMocks();
  });

  describe('push', () => {
    test('calls push on write', async () => {
      const push = jest.fn();
      const router = historyRouter<UiState>({
        writeDelay: 0,
        push,
      });

      router.write({ indexName: { query: 'query' } });
      await wait(0);

      expect(push).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenLastCalledWith({
        state: { indexName: { query: 'query' } },
        title: '',
        url: 'http://localhost/?indexName%5Bquery%5D=query',
      });
    });

    test('defaults to window.history.pushState', async () => {
      const windowPushState = jest.spyOn(window.history, 'pushState');
      const router = historyRouter<UiState>({
        writeDelay: 0,
      });

      router.write({ indexName: { query: 'query' } });
      await wait(0);

      expect(windowPushState).toHaveBeenCalledTimes(1);
      expect(windowPushState).toHaveBeenLastCalledWith(
        { indexName: { query: 'query' } },
        '',
        'http://localhost/?indexName%5Bquery%5D=query'
      );
    });

    test('debounces push calls', async () => {
      const push = jest.fn();
      const router = historyRouter<UiState>({
        writeDelay: 0,
        push,
      });

      router.write({ indexName: { query: 'query1' } });
      router.write({ indexName: { query: 'query2' } });
      router.write({ indexName: { query: 'query3' } });
      await wait(0);

      expect(push).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenLastCalledWith({
        state: { indexName: { query: 'query3' } },
        title: '',
        url: 'http://localhost/?indexName%5Bquery%5D=query3',
      });
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
      expect(getLocation).toHaveBeenLastCalledWith();
    });

    test('calls getLocation on read', async () => {
      const getLocation = jest.fn(() => window.location);
      const router = historyRouter<UiState>({
        getLocation,
      });

      expect(getLocation).toHaveBeenCalledTimes(0);

      router.write({ indexName: { query: 'query1' } });
      await wait(0);

      expect(getLocation).toHaveBeenCalledTimes(1);

      router.read();

      expect(getLocation).toHaveBeenCalledTimes(2);
      expect(getLocation).toHaveBeenLastCalledWith();
    });

    test('calls getLocation on createURL', () => {
      const getLocation = jest.fn(() => window.location);
      const router = historyRouter<UiState>({
        getLocation,
      });

      router.createURL({ indexName: { query: 'query1' } });

      expect(getLocation).toHaveBeenCalledTimes(1);
      expect(getLocation).toHaveBeenCalledWith();
    });
  });

  describe('environment', () => {
    // We don't need to `expect` in this test because it fails as expected when
    // `window` is accessed.
    // eslint-disable-next-line jest/expect-expect
    test('does not fail on environments without window', async () => {
      // @ts-expect-error
      delete global.window;

      const router = historyRouter<UiState>({
        writeDelay: 0,
        push: noop,
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
        windowTitle() {
          return 'Search';
        },
      });

      // We run the whole lifecycle to make sure none of the steps access `window`.
      router.write({ indexName: { query: 'query1' } });
      await wait(0);
      router.read();
      router.onUpdate(noop);
      router.dispose();
      router.createURL({ indexName: { query: 'query1' } });

      (global as any).window = originalWindow;
    });
  });
});
