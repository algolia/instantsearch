/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';

import instantsearch from '../../..';
import { createFeedContainer } from '../../../connectors/feeds/FeedContainer';
import { hits, index, searchBox } from '../../../widgets';
import { buildWidgetTree, serializeWidgetParams } from '../buildWidgetTree';

import type { Widget } from '../../../types';

describe('buildWidgetTree', () => {
  it('recurses into ais.index widgets', () => {
    const search = instantsearch({
      searchClient: createSearchClient(),
      indexName: 'main',
    });

    search.addWidgets([
      searchBox({ container: document.createElement('div') }),
      index({ indexName: 'nested' }).addWidgets([
        hits({ container: document.createElement('div') }),
      ]),
    ]);

    search.start();

    const tree = buildWidgetTree(search.mainIndex.getWidgets(), search);

    expect(tree).toEqual([
      { type: 'ais.searchBox', params: [], children: [] },
      {
        type: 'ais.index',
        params: [],
        children: [
          {
            type: 'ais.hits',
            params: [],
            children: [],
          },
        ],
      },
    ]);
  });

  it('recurses into ais.feedContainer widgets', () => {
    const search = instantsearch({
      searchClient: createSearchClient(),
      indexName: 'main',
    });

    search.start();

    const feedContainer = createFeedContainer(
      'feed-1',
      search.mainIndex,
      search
    );

    search.mainIndex.addWidgets([feedContainer]);
    feedContainer.addWidgets([
      hits({ container: document.createElement('div') }),
    ]);

    const tree = buildWidgetTree(search.mainIndex.getWidgets(), search);

    expect(tree).toEqual([
      {
        type: 'ais.feedContainer',
        params: [],
        children: [
          {
            type: 'ais.hits',
            params: [],
            children: [],
          },
        ],
      },
    ]);
  });

  it("calls a nested widget's getWidgetRenderState with its actual parent index", () => {
    const search = instantsearch({
      searchClient: createSearchClient(),
      indexName: 'main',
    });

    const seenParentIndexNames: string[] = [];
    const spyWidget: Widget = {
      $$type: 'ais.spy',
      $$widgetType: 'ais.spy',
      init() {},
      render() {},
      dispose() {},
      getWidgetRenderState({ parent }) {
        seenParentIndexNames.push(parent.getIndexName());
        return { widgetParams: {} };
      },
    };

    search.addWidgets([
      index({ indexName: 'nested' }).addWidgets([spyWidget]),
    ]);

    search.start();

    buildWidgetTree(search.mainIndex.getWidgets(), search);

    expect(seenParentIndexNames).toEqual(['nested']);
  });
});

describe('serializeWidgetParams', () => {
  it('reports functions by their name with a function type tag', () => {
    function namedHook() {}
    // Forcibly nameless: V8 would otherwise infer a name from the binding.
    const nameless = Object.defineProperty(() => {}, 'name', { value: '' });

    expect(
      serializeWidgetParams({ namedHook, inline: () => {}, nameless })
    ).toEqual([
      { name: 'namedHook', value: 'namedHook', type: 'function' },
      // V8 infers the binding name even for inline arrows.
      { name: 'inline', value: 'inline', type: 'function' },
      { name: 'nameless', value: '', type: 'function' },
    ]);
  });
});
