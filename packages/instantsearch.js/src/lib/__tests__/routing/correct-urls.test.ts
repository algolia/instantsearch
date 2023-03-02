/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';

import { connectPagination, connectSearchBox } from '../../../connectors';
import instantsearch from '../../../index.es';
import { index } from '../../../widgets';
import historyRouter from '../../routers/history';

beforeEach(() => {
  window.history.pushState({}, '', '/');
});

const writeDelay = 10;
const writeWait = 10 * writeDelay;

test('correct URL for widgets', async () => {
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
    connectSearchBox(() => {})({}),
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
});

test('correct URL for widgets in indices with repeated indexId', async () => {
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
});
