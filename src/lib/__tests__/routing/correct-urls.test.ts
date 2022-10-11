/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '../../../../test/mock/createSearchClient';
import instantsearch from '../../../index.es';
import { connectPagination, connectSearchBox } from '../../../connectors';
import { index } from '../../../widgets';
import historyRouter from '../../routers/history';
import { wait } from '../../../../test/utils/wait';

beforeEach(() => {
  window.history.pushState({}, '', '/');
});

test('correct URL for widgets', async () => {
  const writeDelay = 10;
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

  await wait(20);

  expect(window.location.search).toBe(
    `?${encodeURI('indexName[page]=40&indexName[query]=test')}`
  );
});

test('correct URL for widgets in indices with repeated indexId', async () => {
  const writeDelay = 10;
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

  await wait(20);

  expect(window.location.search).toBe(
    `?${encodeURI('indexName[page]=40&indexName[query]=test')}`
  );
});
