import algoliasearchHelper from 'algoliasearch-helper';

import { createWidget } from '../../../../test/createWidget';
import { index } from '../../../widgets';
import { collectWidgetSearchParameters } from '../collectWidgetSearchParameters';
import { isIndexWidget } from '../isIndexWidget';

describe('collectWidgetSearchParameters', () => {
  it('collects search parameters from widgets in order', () => {
    const initialSearchParameters = new algoliasearchHelper.SearchParameters({
      index: 'products',
    });
    const searchBox = createWidget({
      getWidgetSearchParameters: jest.fn((searchParameters, { uiState }) =>
        searchParameters.setQueryParameter('query', uiState.query)
      ),
    });
    const pagination = createWidget({
      getWidgetSearchParameters: jest.fn((searchParameters, { uiState }) =>
        searchParameters.setQueryParameter('page', uiState.page)
      ),
    });

    const actual = collectWidgetSearchParameters([searchBox, pagination], {
      uiState: { query: 'iphone', page: 2 },
      initialSearchParameters,
    });

    expect(actual.query).toBe('iphone');
    expect(actual.page).toBe(2);
  });

  it('preserves the initial search parameters when no widget changes them', () => {
    const initialSearchParameters = new algoliasearchHelper.SearchParameters({
      index: 'products',
    });
    const widget = createWidget();

    const actual = collectWidgetSearchParameters([widget], {
      uiState: {},
      initialSearchParameters,
    });

    expect(actual).toBe(initialSearchParameters);
  });

  it('can skip widgets selected by the caller', () => {
    const initialSearchParameters = new algoliasearchHelper.SearchParameters({
      index: 'products',
    });
    const nestedIndex = index({ indexName: 'related' });
    const getWidgetSearchParameters = jest.spyOn(
      nestedIndex,
      'getWidgetSearchParameters'
    );

    const actual = collectWidgetSearchParameters([nestedIndex], {
      uiState: {},
      initialSearchParameters,
      skipWidget: isIndexWidget,
    });

    expect(actual).toBe(initialSearchParameters);
    expect(getWidgetSearchParameters).not.toHaveBeenCalled();
  });

  it('uses getWidgetParameters for search-dependent widgets by default', () => {
    const initialSearchParameters = new algoliasearchHelper.SearchParameters({
      index: 'products',
    });
    const widget = createWidget({
      dependsOn: 'search',
      getWidgetParameters: jest.fn((searchParameters) =>
        searchParameters.setQueryParameter('query', 'iphone')
      ),
      getWidgetSearchParameters: jest.fn((searchParameters) =>
        searchParameters.setQueryParameter('query', 'wrong')
      ),
    });

    const actual = collectWidgetSearchParameters([widget], {
      uiState: {},
      initialSearchParameters,
    });

    expect(actual.query).toBe('iphone');
    expect(widget.getWidgetParameters).toHaveBeenCalledTimes(1);
    expect(widget.getWidgetSearchParameters).not.toHaveBeenCalled();
  });

  it('can keep using getWidgetSearchParameters for search-dependent widgets', () => {
    const initialSearchParameters = new algoliasearchHelper.SearchParameters({
      index: 'products',
    });
    const widget = createWidget({
      dependsOn: 'search',
      getWidgetParameters: jest.fn((searchParameters) =>
        searchParameters.setQueryParameter('query', 'wrong')
      ),
      getWidgetSearchParameters: jest.fn((searchParameters) =>
        searchParameters.setQueryParameter('query', 'iphone')
      ),
    });

    const actual = collectWidgetSearchParameters([widget], {
      uiState: {},
      initialSearchParameters,
      useWidgetParameters: false,
    });

    expect(actual.query).toBe('iphone');
    expect(widget.getWidgetParameters).not.toHaveBeenCalled();
    expect(widget.getWidgetSearchParameters).toHaveBeenCalledTimes(1);
  });
});
