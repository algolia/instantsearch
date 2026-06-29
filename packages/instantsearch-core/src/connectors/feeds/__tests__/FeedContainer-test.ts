/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { SearchParameters, SearchResults } from 'algoliasearch-helper';

import { createInstantSearch } from '../../../../test/createInstantSearch';
import { createWidget } from '../../../../test/createWidget';
import { index } from '../../../widgets';
import { createFeedContainer } from '../FeedContainer';

import type { IndexWidget } from '../../../types';
import type { SearchResponse } from 'algoliasearch-helper/types/algoliasearch';

function makeParentWithFeeds(
  feedIDs: string[],
  instantSearchInstance: ReturnType<typeof createInstantSearch>
): IndexWidget {
  const parent = index({ indexName: 'test' });
  const state = instantSearchInstance.helper!.state;
  const response: SearchResponse<any> = {
    hits: [],
    nbHits: 0,
    page: 0,
    nbPages: 0,
    hitsPerPage: 10,
    processingTimeMS: 1,
    query: '',
    params: '',
    exhaustiveNbHits: true,
  };

  const results = new SearchResults(state, [response]);
  (results as any).feeds = feedIDs.map((feedID) => {
    const feedResponse: SearchResponse<any> = {
      ...response,
      hits: [{ objectID: `hit-${feedID}` }],
      nbHits: 1,
    };
    const feedResults = new SearchResults(state, [feedResponse]);
    (feedResults as any).feedID = feedID;
    return feedResults;
  });

  // Mock getResults to return results with feeds
  parent.getResults = () => results;
  parent.getHelper = () => instantSearchInstance.helper!;

  return parent;
}

describe('FeedContainer', () => {
  describe('identity', () => {
    it('has $$type ais.feedContainer', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      expect(container.$$type).toBe('ais.feedContainer');
      expect(container.$$widgetType).toBe('ais.feedContainer');
    });

    it('is isolated', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      expect(container._isolated).toBe(true);
    });

    it('uses feedID as indexId', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      expect(container.getIndexId()).toBe('products');
    });

    it('returns parent indexName', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'my-index' });
      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      expect(container.getIndexName()).toBe('my-index');
    });
  });

  describe('helper sharing', () => {
    it('returns parent helper', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      const mockHelper = instantSearchInstance.helper!;
      parent.getHelper = () => mockHelper;

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      expect(container.getHelper()).toBe(mockHelper);
    });
  });

  describe('getResults', () => {
    it('returns null when parent has no results', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      parent.getResults = () => null;

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      expect(container.getResults()).toBeNull();
    });

    it('returns null when parent results have no feeds', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      const state = new SearchParameters({ index: 'test' });
      const results = new SearchResults(state, [
        {
          hits: [],
          nbHits: 0,
          page: 0,
          nbPages: 0,
          hitsPerPage: 10,
          processingTimeMS: 1,
          query: '',
          params: '',
          exhaustiveNbHits: true,
        },
      ]);
      parent.getResults = () => results;

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      expect(container.getResults()).toBeNull();
    });

    it('returns matching feed results by feedID', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = makeParentWithFeeds(
        ['products', 'articles'],
        instantSearchInstance
      );

      const container = createFeedContainer(
        'articles',
        parent,
        instantSearchInstance
      );

      const result = container.getResults();
      expect(result).not.toBeNull();
      expect(result!.hits).toEqual([{ objectID: 'hit-articles' }]);
    });

    it('returns null when feedID not found in feeds', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = makeParentWithFeeds(['products'], instantSearchInstance);

      const container = createFeedContainer(
        'nonexistent',
        parent,
        instantSearchInstance
      );

      expect(container.getResults()).toBeNull();
    });

    it('patches _state with parent helper state', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = makeParentWithFeeds(['products'], instantSearchInstance);

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      const result = container.getResults();
      expect(result!._state).toBe(instantSearchInstance.helper!.state);
    });
  });

  describe('widget management', () => {
    it('addWidgets adds widgets and sets parent', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      const widget = createWidget();
      container.addWidgets([widget]);

      expect(container.getWidgets()).toContain(widget);
      expect(widget.parent).toBe(container);
    });

    it('addWidgets returns the container for chaining', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      const result = container.addWidgets([createWidget()]);
      expect(result).toBe(container);
    });

    it('removeWidgets removes widgets and calls dispose', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      parent.getHelper = () => instantSearchInstance.helper!;

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      const widget = createWidget();
      container.addWidgets([widget]);
      container.removeWidgets([widget]);

      expect(container.getWidgets()).not.toContain(widget);
      expect(widget.dispose).toHaveBeenCalled();
    });

    it('removeWidgets chains dispose state through children', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      parent.getHelper = () => instantSearchInstance.helper!;

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      const initialState = instantSearchInstance.helper!.state;
      const stateAfterFirst = new SearchParameters({ index: 'after-first' });
      const stateAfterSecond = new SearchParameters({ index: 'after-second' });

      const widget1 = createWidget({
        dispose: jest.fn(() => stateAfterFirst),
      });
      const widget2 = createWidget({
        dispose: jest.fn(() => stateAfterSecond),
      });

      container.addWidgets([widget1, widget2]);
      container.removeWidgets([widget1, widget2]);

      expect(widget1.dispose).toHaveBeenCalledWith(
        expect.objectContaining({ state: initialState })
      );
      expect(widget2.dispose).toHaveBeenCalledWith(
        expect.objectContaining({ state: stateAfterFirst })
      );
    });

    it('removeWidgets applies cleaned state to the helper', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      parent.getHelper = () => instantSearchInstance.helper!;

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      const cleanedState = instantSearchInstance.helper!.state.setQueryParameter(
        'disjunctiveFacets',
        []
      );
      const widget = createWidget({
        dispose: jest.fn(() => cleanedState),
      });

      container.addWidgets([widget]);
      const setStateSpy = jest.spyOn(instantSearchInstance.helper!, 'setState');

      container.removeWidgets([widget]);

      expect(setStateSpy).toHaveBeenCalledWith(cleanedState);
    });

    it('addWidgets inits widgets only after container init', () => {
      const instantSearchInstance = createInstantSearch({
        started: true,
      } as any);
      const parent = index({ indexName: 'test' });
      parent.getHelper = () => instantSearchInstance.helper!;

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      const widget = createWidget();
      container.addWidgets([widget]);

      // Widget is stored but not yet initialized
      expect(widget.init).not.toHaveBeenCalled();

      // After container init, stored widgets are initialized
      container.init({} as any);
      expect(widget.init).toHaveBeenCalled();

      // Widgets added after init are initialized immediately
      const widget2 = createWidget();
      container.addWidgets([widget2]);
      expect(widget2.init).toHaveBeenCalled();
    });

    it('addWidgets flattens nested widget arrays', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      const widget1 = createWidget();
      const widget2 = createWidget();
      container.addWidgets([[widget1], widget2] as any);

      expect(container.getWidgets()).toEqual(
        expect.arrayContaining([widget1, widget2])
      );
    });
  });

  describe('lifecycle', () => {
    it('init calls init on all child widgets', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      parent.getHelper = () => instantSearchInstance.helper!;

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      const widget1 = createWidget();
      const widget2 = createWidget();
      container.addWidgets([widget1, widget2]);

      container.init({} as any);

      expect(widget1.init).toHaveBeenCalled();
      expect(widget2.init).toHaveBeenCalled();
    });

    it('render calls render on all child widgets', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      parent.getHelper = () => instantSearchInstance.helper!;

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      const widget1 = createWidget();
      const widget2 = createWidget();
      container.addWidgets([widget1, widget2]);

      container.render({} as any);

      expect(widget1.render).toHaveBeenCalled();
      expect(widget2.render).toHaveBeenCalled();
    });

    it('dispose disposes all child widgets and clears the list', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      parent.getHelper = () => instantSearchInstance.helper!;

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      const widget1 = createWidget();
      const widget2 = createWidget();
      container.addWidgets([widget1, widget2]);

      container.dispose();

      expect(widget1.dispose).toHaveBeenCalled();
      expect(widget2.dispose).toHaveBeenCalled();
      expect(container.getWidgets()).toEqual([]);
    });
  });

  describe('delegation', () => {
    it('delegates getScopedResults to parent', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      const scopedResults = [{ indexId: 'test', results: null, helper: null }];
      parent.getScopedResults = () => scopedResults as any;

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      expect(container.getScopedResults()).toBe(scopedResults);
    });

    it('delegates createURL to parent', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      parent.createURL = jest.fn(() => '#test');

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      const state = new SearchParameters({ index: 'test' });
      container.createURL(state);
      expect(parent.createURL).toHaveBeenCalledWith(state);
    });

    it('delegates scheduleLocalSearch to parent', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      parent.scheduleLocalSearch = jest.fn();

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      container.scheduleLocalSearch();
      expect(parent.scheduleLocalSearch).toHaveBeenCalled();
    });
  });

  describe('getWidgetSearchParameters', () => {
    it('reduces through child widgets', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      const widget = createWidget({
        getWidgetSearchParameters: jest.fn((params: SearchParameters) =>
          params.addDisjunctiveFacet('brand')
        ),
      });

      container.addWidgets([widget]);

      const state = new SearchParameters({ index: 'test' });
      const result = container.getWidgetSearchParameters(state, {
        uiState: {},
      });

      expect(result.disjunctiveFacets).toContain('brand');
    });
  });

  describe('getResultsForWidget', () => {
    it('returns same as getResults', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = makeParentWithFeeds(['products'], instantSearchInstance);

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      const widget = createWidget();
      expect(container.getResultsForWidget(widget)).toBe(
        container.getResults()
      );
    });
  });

  describe('getWidgetUiState', () => {
    it('reduces through child widgets', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      parent.getHelper = () => instantSearchInstance.helper!;

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      const widget = createWidget({
        getWidgetUiState: jest.fn((uiState) => ({
          ...uiState,
          refinementList: { brand: ['Apple'] },
        })),
      });

      container.addWidgets([widget]);

      const result = container.getWidgetUiState({});
      expect(result).toEqual({
        refinementList: { brand: ['Apple'] },
      });
    });
  });

  describe('dispose return value', () => {
    it('returns cleaned state after chaining through children', () => {
      const instantSearchInstance = createInstantSearch();
      const parent = index({ indexName: 'test' });
      parent.getHelper = () => instantSearchInstance.helper!;

      const container = createFeedContainer(
        'products',
        parent,
        instantSearchInstance
      );

      const cleanedState = new SearchParameters({ index: 'cleaned' });
      const widget = createWidget({
        dispose: jest.fn(() => cleanedState),
      });

      container.addWidgets([widget]);

      const result = container.dispose({
        helper: instantSearchInstance.helper!,
        state: instantSearchInstance.helper!.state,
        recommendState: instantSearchInstance.helper!.recommendState,
        parent: container,
      });

      expect(result).toBe(cleanedState);
    });
  });
});
