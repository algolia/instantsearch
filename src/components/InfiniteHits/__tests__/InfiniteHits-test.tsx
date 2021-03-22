/** @jsx h */

import { h } from 'preact';
import { render } from '@testing-library/preact';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import InfiniteHits from '../InfiniteHits';
import { Hits, SearchResponse } from '../../../types';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';

function createResults(partialResults: Partial<SearchResponse<any>>) {
  return new SearchResults(new SearchParameters(), [
    createSingleSearchResponse(partialResults),
  ]);
}

describe('InfiniteHits', () => {
  const cssClasses = {
    root: 'root',
    emptyRoot: 'emptyRoot',
    item: 'item',
    list: 'list',
    loadPrevious: 'loadPrevious',
    disabledLoadPrevious: 'disabledLoadPrevious',
    loadMore: 'loadMore',
    disabledLoadMore: 'disabledLoadMore',
  };

  const sendEvent = () => {};
  const bindEvent = () => '';

  describe('markup', () => {
    it('should render <InfiniteHits /> on first page', () => {
      const hits: Hits = [
        {
          objectID: 'one',
          foo: 'bar',
          __position: 0,
        },
        {
          objectID: 'two',
          foo: 'baz',
          __position: 1,
        },
      ];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: createResults({ hits }),
        hits,
        isFirstPage: true,
        isLastPage: false,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
        sendEvent,
        bindEvent,
      };

      const { container } = render(<InfiniteHits {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> on last page', () => {
      const hits: Hits = [
        {
          objectID: 'one',
          foo: 'bar',
          __position: 0,
        },
        {
          objectID: 'two',
          foo: 'baz',
          __position: 1,
        },
      ];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: createResults({ hits }),
        hits,
        isFirstPage: false,
        isLastPage: true,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
        sendEvent,
        bindEvent,
      };

      const { container } = render(<InfiniteHits {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> without hits on first page', () => {
      const hits: Hits = [];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: createResults({ hits }),
        hits,
        isFirstPage: true,
        isLastPage: false,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
        sendEvent,
        bindEvent,
      };

      const { container } = render(<InfiniteHits {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> without hits on last page', () => {
      const hits: Hits = [];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: createResults({ hits }),
        hits,
        isFirstPage: false,
        isLastPage: true,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
        sendEvent,
        bindEvent,
      };

      const { container } = render(<InfiniteHits {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> with "Show previous" button on first page', () => {
      const hits: Hits = [
        {
          objectID: 'one',
          foo: 'bar',
          __position: 0,
        },
        {
          objectID: 'two',
          foo: 'baz',
          __position: 1,
        },
      ];

      const props = {
        hasShowPrevious: true,
        showPrevious: () => {},
        showMore: () => {},
        results: createResults({ hits }),
        hits,
        isFirstPage: true,
        isLastPage: false,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
        sendEvent,
        bindEvent,
      };

      const { container } = render(<InfiniteHits {...props} />);

      const previousButton = container.querySelector('.loadPrevious');

      expect(previousButton).toBeInTheDocument();
      expect(previousButton).toHaveClass('disabledLoadPrevious');
      expect(previousButton).toBeDisabled();
      expect(container).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> with "Show previous" button on last page', () => {
      const hits: Hits = [
        {
          objectID: 'one',
          foo: 'bar',
          __position: 0,
        },
        {
          objectID: 'two',
          foo: 'baz',
          __position: 1,
        },
      ];

      const props = {
        hasShowPrevious: true,
        showPrevious: () => {},
        showMore: () => {},
        results: createResults({ hits }),
        hits,
        isFirstPage: false,
        isLastPage: true,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
        sendEvent,
        bindEvent,
      };

      const { container } = render(<InfiniteHits {...props} />);

      const previousButton = container.querySelector('.loadPrevious');

      expect(previousButton).toBeInTheDocument();
      expect(previousButton).not.toHaveClass('disabledLoadPrevious');
      expect(previousButton).not.toBeDisabled();
      expect(container).toMatchSnapshot();
    });
  });
});
