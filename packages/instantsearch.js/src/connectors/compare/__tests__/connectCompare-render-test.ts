/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';

import InstantSearch from '../../../lib/InstantSearch';
import connectCompare from '../connectCompare';

function setup(searchClient = createSearchClient()) {
  const search = new InstantSearch({ indexName: 'indexName', searchClient });
  const renderFns = [jest.fn(), jest.fn()];
  const widgets = renderFns.map((renderFn) => connectCompare(renderFn)({}));
  search.addWidgets(widgets);
  search.start();
  return { search, renderFns };
}

const lastState = (renderFn: jest.Mock) =>
  renderFn.mock.calls[renderFn.mock.calls.length - 1][0];

describe('connectCompare rendering', () => {
  test('renders each widget once per selection change', async () => {
    const { search, renderFns } = setup();
    await wait(0);

    const before = renderFns.map((fn) => fn.mock.calls.length);
    lastState(renderFns[0]).toggleItem({ objectID: 'a' });
    await wait(0);

    renderFns.forEach((fn, i) => {
      expect(fn.mock.calls.length - before[i]).toBe(1);
      expect(lastState(fn).items).toEqual([{ objectID: 'a' }]);
    });
    search.dispose();
  });

  test('renders once, synchronously, before the first results', async () => {
    const { search, renderFns } = setup(
      createSearchClient({ search: () => new Promise(() => {}) })
    );
    await wait(0);

    const before = renderFns.map((fn) => fn.mock.calls.length);
    lastState(renderFns[0]).toggleItem({ objectID: 'a' });
    renderFns.forEach((fn, i) => {
      expect(fn.mock.calls.length - before[i]).toBe(1);
    });
    await wait(0);
    renderFns.forEach((fn, i) => {
      expect(fn.mock.calls.length - before[i]).toBe(1);
      expect(lastState(fn).items).toEqual([{ objectID: 'a' }]);
    });
    expect(search.renderState.indexName.compare!.items).toEqual([
      { objectID: 'a' },
    ]);
    search.dispose();
  });

  test('re-renders widgets that are not compare listeners', async () => {
    const { search, renderFns } = setup();
    const renderSpy = jest.fn();
    const reader = {
      $$type: 'test.reader',
      dispose: () => {},
      render: ({ instantSearchInstance }: any) => {
        renderSpy(instantSearchInstance.renderState.indexName.compare.items);
      },
    };
    search.addWidgets([reader as any]);
    await wait(0);

    lastState(renderFns[0]).toggleItem({ objectID: 'a' });
    await wait(0);

    expect(renderSpy).toHaveBeenLastCalledWith([{ objectID: 'a' }]);
    search.dispose();
  });

  test('keeps renderState.compare in sync', async () => {
    const { search, renderFns } = setup();
    await wait(0);

    lastState(renderFns[0]).toggleItem({ objectID: 'a' });
    await wait(0);
    expect(search.renderState.indexName.compare!.items).toEqual([
      { objectID: 'a' },
    ]);
    search.dispose();
  });
});
