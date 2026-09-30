/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';

import { connectPagination, connectSearchBox } from '../../../connectors';
import instantsearch from '../../../index.es';
import { index } from '../../../widgets';
import simpleStateMapping from '../../stateMappings/simple';
import historyRouter from '../history';

import type { Widget } from '../../../types';

beforeEach(() => {
  window.history.pushState({}, '', '/');
});

const writeDelay = 10;
const writeWait = 10 * writeDelay;

test('keeps url with cleanUrlOnDispose: false', async () => {
  const router = historyRouter({ writeDelay, cleanUrlOnDispose: false });

  const indexName = 'indexName';
  const search = instantsearch({
    indexName,
    searchClient: createSearchClient(),
    routing: {
      router,
    },
  });

  search.addWidgets([
    connectPagination(() => {})({}),
    index({ indexName }).addWidgets([connectSearchBox(() => {})({})]),
  ]);

  search.start();

  expect(window.location.search).toBe('');

  // on nested index
  search.renderState[indexName].searchBox!.refine('test');
  // on main index
  search.renderState[indexName].pagination!.refine(39);

  await wait(writeWait);

  expect(window.location.search).toBe(
    `?${encodeURI('indexName[page]=40&indexName[query]=test')}`
  );

  search.dispose();

  await wait(writeWait);

  // URL has not been cleaned
  expect(window.location.search).toBe(
    `?${encodeURI('indexName[page]=40&indexName[query]=test')}`
  );
});

test('clears url with cleanUrlOnDispose: true', async () => {
  const router = historyRouter({ writeDelay, cleanUrlOnDispose: true });

  const indexName = 'indexName';
  const search = instantsearch({
    indexName,
    searchClient: createSearchClient(),
    routing: {
      router,
    },
  });

  search.addWidgets([
    connectPagination(() => {})({}),
    index({ indexName }).addWidgets([connectSearchBox(() => {})({})]),
  ]);

  search.start();

  expect(window.location.search).toBe('');

  // on nested index
  search.renderState[indexName].searchBox!.refine('test');
  // on main index
  search.renderState[indexName].pagination!.refine(39);

  await wait(writeWait);

  expect(window.location.search).toBe(
    `?${encodeURI('indexName[page]=40&indexName[query]=test')}`
  );

  search.dispose();

  await wait(writeWait);

  // URL has been cleaned
  expect(window.location.search).toBe('');
});

test('clears url with cleanUrlOnDispose: undefined', async () => {
  const router = historyRouter({ writeDelay });

  const indexName = 'indexName';
  const search = instantsearch({
    indexName,
    searchClient: createSearchClient(),
    routing: {
      router,
    },
  });

  search.addWidgets([
    connectPagination(() => {})({}),
    index({ indexName }).addWidgets([connectSearchBox(() => {})({})]),
  ]);

  search.start();

  expect(window.location.search).toBe('');

  // on nested index
  search.renderState[indexName].searchBox!.refine('test');
  // on main index
  search.renderState[indexName].pagination!.refine(39);

  await wait(writeWait);

  expect(window.location.search).toBe(
    `?${encodeURI('indexName[page]=40&indexName[query]=test')}`
  );

  search.dispose();

  await wait(writeWait);

  // URL has been cleaned
  expect(window.location.search).toBe('');
});

describe('after a popstate', () => {
  const indexName = 'indexName';

  type OnStateChange = NonNullable<
    Parameters<typeof instantsearch>[0]['onStateChange']
  >;

  function createSearch({
    onStateChange,
  }: { onStateChange?: OnStateChange } = {}) {
    const search = instantsearch({
      indexName,
      searchClient: createSearchClient(),
      routing: {
        router: historyRouter({ writeDelay, cleanUrlOnDispose: false }),
      },
      onStateChange,
    });

    search.addWidgets([connectPagination(() => {})({})]);
    search.start();

    return search;
  }

  function navigate(go: () => void) {
    const popState = new Promise((resolve) =>
      window.addEventListener('popstate', resolve, { once: true })
    );
    go();
    return popState;
  }

  test('writes the next change when the popstate left the state unchanged', async () => {
    const search = createSearch();

    // Following an anchor fires a popstate too.
    await navigate(() => {
      window.location.hash = 'details';
    });
    await wait(writeWait);

    // Going back does not change the search state.
    await navigate(() => window.history.back());
    await wait(writeWait);

    search.renderState[indexName].pagination!.refine(1);
    await wait(writeWait);

    expect(window.location.search).toBe(`?${encodeURI('indexName[page]=2')}`);

    search.dispose();
  });

  test('writes the next change when the popstate URL has reordered parameters', async () => {
    const search = instantsearch({
      indexName,
      searchClient: createSearchClient(),
      routing: {
        router: historyRouter({ writeDelay, cleanUrlOnDispose: false }),
      },
    });
    search.addWidgets([
      connectPagination(() => {})({}),
      connectSearchBox(() => {})({}),
    ]);
    search.start();

    search.renderState[indexName].searchBox!.refine('query');
    search.renderState[indexName].pagination!.refine(1);
    await wait(writeWait);

    // The same state, with its parameters in another order.
    const parameters = window.location.search.slice(1).split('&');
    expect(parameters).toHaveLength(2);
    window.history.replaceState({}, '', `?${parameters.reverse().join('&')}`);

    await navigate(() => {
      window.location.hash = 'details';
    });
    await wait(writeWait);

    search.renderState[indexName].pagination!.refine(2);
    await wait(writeWait);

    expect(window.location.search).toContain(encodeURI('indexName[page]=3'));

    search.dispose();
  });

  test('writes the next change when the popstate URL is rewritten to the current state', async () => {
    const search = createSearch();
    await wait(writeWait);

    // InstantSearch drops the unknown parameter, so this URL has the current state.
    window.history.pushState(
      {},
      '',
      `/?${encodeURI('indexName[unknown]=value')}`
    );
    await navigate(() => {
      window.location.hash = 'details';
    });
    await navigate(() => window.history.back());
    await wait(writeWait);

    search.renderState[indexName].pagination!.refine(1);
    await wait(writeWait);

    expect(window.location.search).toBe(`?${encodeURI('indexName[page]=2')}`);

    search.dispose();
  });

  test('does not push the state it navigated to when InstantSearch rewrites its URL', async () => {
    window.history.pushState(
      {},
      '',
      `/?${encodeURI('indexName[unknown]=value')}`
    );
    const search = createSearch();
    await wait(writeWait);

    search.renderState[indexName].pagination!.refine(1);
    await wait(writeWait);

    const historyLength = window.history.length;

    await navigate(() => window.history.back());
    await wait(writeWait);

    expect(window.location.search).toBe(
      `?${encodeURI('indexName[unknown]=value')}`
    );
    expect(window.history.length).toBe(historyLength);

    search.dispose();
  });

  test('writes a change made before the popstate write is flushed', async () => {
    const search = createSearch();

    search.renderState[indexName].pagination!.refine(1);
    await wait(writeWait);

    await navigate(() => window.history.back());
    search.renderState[indexName].pagination!.refine(4);
    await wait(writeWait);

    expect(window.location.search).toBe(`?${encodeURI('indexName[page]=5')}`);

    search.dispose();
  });

  test('writes a change made in the same task as the popstate', async () => {
    const search = createSearch();

    search.renderState[indexName].pagination!.refine(1);
    await wait(writeWait);

    // Another popstate listener refines after the router applied the route.
    const refineOnPopState = () => {
      search.renderState[indexName].pagination!.refine(4);
    };
    window.addEventListener('popstate', refineOnPopState, { once: true });

    await navigate(() => window.history.back());
    await wait(writeWait);

    expect(window.location.search).toBe(`?${encodeURI('indexName[page]=5')}`);

    search.dispose();
  });

  test('writes the next change when notifying the popstate update throws', async () => {
    const stateMapping = simpleStateMapping();
    let shouldThrow = false;
    const search = instantsearch({
      indexName,
      searchClient: createSearchClient(),
      routing: {
        router: historyRouter({ writeDelay, cleanUrlOnDispose: false }),
        stateMapping: {
          ...stateMapping,
          stateToRoute(uiState) {
            if (shouldThrow) {
              shouldThrow = false;
              throw new Error('Cannot map the UI state');
            }

            return stateMapping.stateToRoute(uiState);
          },
        },
      },
    });
    search.addWidgets([connectPagination(() => {})({})]);
    search.start();

    // Catch the error where it's thrown rather than in the deferred notification.
    const errors: unknown[] = [];
    const { instance: routerMiddleware } = search.middleware.find(
      ({ instance }) => instance.$$type.startsWith('ais.router')
    )!;
    const onStateChange = routerMiddleware.onStateChange;
    routerMiddleware.onStateChange = (event) => {
      try {
        onStateChange(event);
      } catch (error) {
        errors.push(error);
      }
    };

    search.renderState[indexName].pagination!.refine(1);
    await wait(writeWait);

    shouldThrow = true;
    await navigate(() => window.history.back());
    await wait(writeWait);

    expect(errors).toEqual([new Error('Cannot map the UI state')]);

    search.renderState[indexName].pagination!.refine(4);
    await wait(writeWait);

    expect(window.location.search).toBe(`?${encodeURI('indexName[page]=5')}`);

    search.dispose();
  });

  test('does not push the state it navigated to when a child index throws applying it', async () => {
    let shouldThrow = false;
    const throwingWidget = {
      $$type: 'ais.throwing',
      init() {},
      render() {},
      getWidgetUiState(uiState) {
        return uiState;
      },
      getWidgetSearchParameters(state, { uiState }) {
        if (shouldThrow && uiState.query === 'a') {
          throw new Error('Cannot apply the UI state');
        }

        return state;
      },
    } as Widget;

    window.history.pushState(
      {},
      '',
      `/?${encodeURI('indexName[page]=5&childIndexName[query]=a')}`
    );
    const search = instantsearch({
      indexName,
      searchClient: createSearchClient(),
      routing: {
        router: historyRouter({ writeDelay, cleanUrlOnDispose: false }),
      },
    });
    search.addWidgets([
      connectPagination(() => {})({}),
      index({ indexName: 'childIndexName' }).addWidgets([throwingWidget]),
    ]);
    search.start();
    await wait(writeWait);

    search.setUiState({
      [indexName]: { page: 2 },
      childIndexName: { query: 'b' },
    });
    await wait(writeWait);

    const nextEntry = window.location.search;
    const historyLength = window.history.length;

    // The error is thrown in the popstate listener.
    const errors: unknown[] = [];
    const onError = (event: ErrorEvent) => {
      event.preventDefault();
      errors.push(event.error);
    };
    window.addEventListener('error', onError);

    shouldThrow = true;
    await navigate(() => window.history.back());
    await wait(writeWait);
    shouldThrow = false;

    window.removeEventListener('error', onError);
    expect(errors).toEqual([new Error('Cannot apply the UI state')]);

    // The main index is applied, but the partial state isn't pushed.
    expect(search.getUiState()[indexName].page).toBe(5);
    expect(window.location.search).toBe(
      `?${encodeURI('indexName[page]=5&childIndexName[query]=a')}`
    );
    expect(window.history.length).toBe(historyLength);

    await navigate(() => window.history.forward());
    await wait(writeWait);

    expect(window.location.search).toBe(nextEntry);

    search.dispose();
  });

  test('does not push the state it navigated to', async () => {
    const search = createSearch();

    search.renderState[indexName].pagination!.refine(1);
    await wait(writeWait);
    search.renderState[indexName].pagination!.refine(2);
    await wait(writeWait);

    const historyLength = window.history.length;

    await navigate(() => window.history.back());
    await wait(writeWait);

    expect(window.location.search).toBe(`?${encodeURI('indexName[page]=2')}`);
    expect(window.history.length).toBe(historyLength);

    await navigate(() => window.history.forward());
    await wait(writeWait);

    expect(window.location.search).toBe(`?${encodeURI('indexName[page]=3')}`);

    search.dispose();
  });

  describe('with a controlled state applied later', () => {
    const onStateChange: OnStateChange = ({ uiState, setUiState }) => {
      setTimeout(() => setUiState(uiState), writeDelay);
    };

    test('does not push the state it navigated to', async () => {
      // InstantSearch drops the unknown parameter when writing this state.
      window.history.pushState(
        {},
        '',
        `/?${encodeURI('indexName[unknown]=value')}`
      );
      const search = createSearch({ onStateChange });
      await wait(writeWait);

      search.renderState[indexName].pagination!.refine(1);
      await wait(writeWait);

      const historyLength = window.history.length;

      await navigate(() => window.history.back());
      await wait(writeWait);

      expect(window.location.search).toBe(
        `?${encodeURI('indexName[unknown]=value')}`
      );
      expect(window.history.length).toBe(historyLength);

      search.dispose();
    });

    test('writes the next change when the popstate left the state unchanged', async () => {
      const search = createSearch({ onStateChange });

      await navigate(() => {
        window.location.hash = 'details';
      });
      await wait(writeWait);

      await navigate(() => window.history.back());
      await wait(writeWait);

      search.renderState[indexName].pagination!.refine(1);
      await wait(writeWait);

      expect(window.location.search).toBe(`?${encodeURI('indexName[page]=2')}`);

      search.dispose();
    });

    test('writes a change that supersedes the popstate update', async () => {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const search = createSearch({
        // Only the last state within the delay is applied.
        onStateChange({ uiState, setUiState }) {
          clearTimeout(timer);
          timer = setTimeout(() => setUiState(uiState), 2 * writeDelay);
        },
      });
      await wait(writeWait);

      search.renderState[indexName].pagination!.refine(1);
      await wait(writeWait);

      await navigate(() => window.history.back());
      // Refine before the popstate update is applied, which drops it.
      search.renderState[indexName].pagination!.refine(4);
      await wait(writeWait);

      expect(window.location.search).toBe(`?${encodeURI('indexName[page]=5')}`);

      search.dispose();
    });

    test('does not push any of several popstate updates applied late', async () => {
      const search = createSearch({ onStateChange });
      await wait(writeWait);

      search.renderState[indexName].pagination!.refine(1);
      await wait(writeWait);
      search.renderState[indexName].pagination!.refine(2);
      await wait(writeWait);

      const historyLength = window.history.length;

      // Going back twice before the first update is applied.
      await navigate(() => window.history.back());
      await navigate(() => window.history.back());
      await wait(writeWait);

      expect(window.location.search).toBe('');
      expect(window.history.length).toBe(historyLength);

      await navigate(() => window.history.forward());
      await wait(writeWait);

      expect(window.location.search).toBe(`?${encodeURI('indexName[page]=2')}`);

      search.dispose();
    });

    test('does not push a transformed popstate state', async () => {
      window.history.pushState({}, '', `/?${encodeURI('indexName[page]=5')}`);
      const search = createSearch({
        // The page applied is at most 3.
        onStateChange: ({ uiState, setUiState }) => {
          setUiState({
            ...uiState,
            [indexName]: {
              ...uiState[indexName],
              page: Math.min(uiState[indexName].page ?? 1, 3),
            },
          });
        },
      });
      await wait(writeWait);

      search.renderState[indexName].pagination!.refine(1);
      await wait(writeWait);

      expect(window.location.search).toBe(`?${encodeURI('indexName[page]=2')}`);
      const historyLength = window.history.length;

      await navigate(() => window.history.back());
      await wait(writeWait);

      // Page 3 is applied, but isn't pushed as it would drop the Forward entry.
      expect(search.getUiState()[indexName].page).toBe(3);
      expect(window.location.search).toBe(`?${encodeURI('indexName[page]=5')}`);
      expect(window.history.length).toBe(historyLength);

      await navigate(() => window.history.forward());
      await wait(writeWait);

      expect(window.location.search).toBe(`?${encodeURI('indexName[page]=2')}`);

      search.dispose();
    });
  });
});
