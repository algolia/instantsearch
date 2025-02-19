/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';

import { historyRouter } from '..';
import { connectPagination, connectSearchBox } from '../../connectors';
import { instantsearch } from '../../instantsearch';
import { index } from '../../widgets';

beforeEach(() => {
  window.history.pushState({}, '', '/');
});

const writeDelay = 10;
const writeWait = 10 * writeDelay;

describe('historyRouter({ cleanUrlOnDispose })', () => {
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

  test('does not clear url with cleanUrlOnDispose: undefined', async () => {
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

    // URL has not been cleaned
    expect(window.location.search).toBe(
      `?${encodeURI('indexName[page]=40&indexName[query]=test')}`
    );
  });
});
