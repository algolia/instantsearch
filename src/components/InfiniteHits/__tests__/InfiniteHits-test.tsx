import React from 'react';
import { mount } from 'enzyme';
import InfiniteHits from '../InfiniteHits';
import { Hits, SearchResults } from '../../../types';

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
        results: { hits } as SearchResults,
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
      };

      const tree = mount(<InfiniteHits {...props} />);

      expect(tree).toMatchSnapshot();
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
        results: { hits } as SearchResults,
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
      };

      const tree = mount(<InfiniteHits {...props} />);

      expect(tree).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> without hits on first page', () => {
      const hits: Hits = [];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: { hits } as SearchResults,
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
      };

      const tree = mount(<InfiniteHits {...props} />);

      expect(tree).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> without hits on last page', () => {
      const hits: Hits = [];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: { hits } as SearchResults,
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
      };

      const tree = mount(<InfiniteHits {...props} />);

      expect(tree).toMatchSnapshot();
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
        results: { hits } as SearchResults,
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
      };

      const tree = mount(<InfiniteHits {...props} />);

      const previousButton = tree.find('.loadPrevious');

      expect(previousButton.exists()).toEqual(true);
      expect(previousButton.hasClass('disabledLoadPrevious')).toEqual(true);
      expect(previousButton.props().disabled).toEqual(true);
      expect(tree).toMatchSnapshot();
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
        results: { hits } as SearchResults,
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
      };

      const tree = mount(<InfiniteHits {...props} />);

      const previousButton = tree.find('.loadPrevious');

      expect(previousButton.exists()).toEqual(true);
      expect(previousButton.hasClass('disabledLoadPrevious')).toEqual(false);
      expect(previousButton.props().disabled).toEqual(false);
      expect(tree).toMatchSnapshot();
    });
  });
});
