import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createMultiSearchResponse } from '../../../../test/mock/createAPIResponse';
import ratingMenu from '../rating-menu';

function getInitializedWidget() {
  const container = document.createElement('div');
  const attribute = 'rating';
  const widget = ratingMenu({
    container,
    attribute,
  });

  const helper = jsHelper(
    createSearchClient(),
    '',
    widget.getWidgetSearchParameters!(new SearchParameters({}), {
      uiState: {},
    })
  );

  widget.init!(createInitOptions({ helper }));

  return { widget, container, helper, attribute };
}

describe('rendering', () => {
  it('has correct URLs', () => {
    const { widget, container, helper, attribute } = getInitializedWidget();

    widget.render!(
      createRenderOptions({
        helper,
        results: new SearchResults(
          helper.state,
          createMultiSearchResponse({
            facets: {
              [attribute]: {
                0: 5,
                1: 10,
                2: 20,
                3: 50,
                4: 900,
                5: 100,
              },
            },
          }).results
        ),
        createURL(searchParams) {
          return JSON.stringify(searchParams);
        },
      })
    );

    const links = container.querySelectorAll('a');

    expect(links).toHaveLength(4);

    expect(JSON.parse(links[0].getAttribute('href')!)).toEqual({
      facets: [],
      disjunctiveFacets: ['rating'],
      hierarchicalFacets: [],
      facetsRefinements: {},
      facetsExcludes: {},
      disjunctiveFacetsRefinements: {},
      numericRefinements: { rating: { '<=': [5], '>=': [4] } },
      tagRefinements: [],
      hierarchicalFacetsRefinements: {},
      index: '',
    });

    expect(JSON.parse(links[1].getAttribute('href')!)).toEqual({
      facets: [],
      disjunctiveFacets: ['rating'],
      hierarchicalFacets: [],
      facetsRefinements: {},
      facetsExcludes: {},
      disjunctiveFacetsRefinements: {},
      numericRefinements: { rating: { '<=': [5], '>=': [3] } },
      tagRefinements: [],
      hierarchicalFacetsRefinements: {},
      index: '',
    });

    expect(JSON.parse(links[2].getAttribute('href')!)).toEqual({
      facets: [],
      disjunctiveFacets: ['rating'],
      hierarchicalFacets: [],
      facetsRefinements: {},
      facetsExcludes: {},
      disjunctiveFacetsRefinements: {},
      numericRefinements: { rating: { '<=': [5], '>=': [2] } },
      tagRefinements: [],
      hierarchicalFacetsRefinements: {},
      index: '',
    });

    expect(JSON.parse(links[3].getAttribute('href')!)).toEqual({
      facets: [],
      disjunctiveFacets: ['rating'],
      hierarchicalFacets: [],
      facetsRefinements: {},
      facetsExcludes: {},
      disjunctiveFacetsRefinements: {},
      numericRefinements: { rating: { '<=': [5], '>=': [1] } },
      tagRefinements: [],
      hierarchicalFacetsRefinements: {},
      index: '',
    });
  });
});
