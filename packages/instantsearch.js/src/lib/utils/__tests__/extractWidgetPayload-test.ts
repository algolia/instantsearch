/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';

import instantsearch from '../../..';
import { createFeedContainer } from '../../../connectors/feeds/FeedContainer';
import { hits, index, searchBox } from '../../../widgets';
import { extractWidgetPayload } from '../extractWidgetPayload';

import type { Widget } from '../../../types';
import type { WidgetMetadata } from '../extractWidgetPayload';

describe('extractWidgetPayload', () => {
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

    const payload: { widgets: WidgetMetadata[] } = { widgets: [] };

    extractWidgetPayload(search.mainIndex.getWidgets(), search, payload);

    expect(payload.widgets).toEqual([
      { type: 'ais.searchBox', widgetType: 'ais.searchBox', params: [] },
      { type: 'ais.index', widgetType: 'ais.index', params: [] },
      { type: 'ais.hits', widgetType: 'ais.hits', params: [] },
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

    const payload: { widgets: WidgetMetadata[] } = { widgets: [] };

    extractWidgetPayload(search.mainIndex.getWidgets(), search, payload);

    expect(payload.widgets).toEqual([
      {
        type: 'ais.feedContainer',
        widgetType: 'ais.feedContainer',
        params: [],
      },
      { type: 'ais.hits', widgetType: 'ais.hits', params: [] },
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

    const payload: { widgets: WidgetMetadata[] } = { widgets: [] };
    extractWidgetPayload(search.mainIndex.getWidgets(), search, payload);

    expect(seenParentIndexNames).toEqual(['nested']);
  });
});
