/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';

import instantsearch from '../../..';
import { createFeedContainer } from '../../../connectors/feeds/FeedContainer';
import { hits, index, searchBox } from '../../../widgets';
import { buildWidgetTree } from '../buildWidgetTree';

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
});
