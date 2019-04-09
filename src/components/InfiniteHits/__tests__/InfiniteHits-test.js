import React from 'react';
import { mount } from 'enzyme';
import InfiniteHits from '../InfiniteHits';

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
      const hits = [
        {
          objectID: 'one',
          foo: 'bar',
        },
        {
          objectID: 'two',
          foo: 'baz',
        },
      ];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: { hits },
        hits,
        isFirstPage: true,
        isLastPage: false,
        templateProps: {
          templates: {
            item: 'item',
            showMoreText: 'showMoreText',
          },
        },
        cssClasses,
      };

      const tree = mount(<InfiniteHits {...props} />);

      expect(tree).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> on last page', () => {
      const hits = [
        {
          objectID: 'one',
          foo: 'bar',
        },
        {
          objectID: 'two',
          foo: 'baz',
        },
      ];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: { hits },
        hits,
        isFirstPage: false,
        isLastPage: true,
        templateProps: {
          templates: {
            item: 'item',
            showMoreText: 'showMoreText',
          },
        },
        cssClasses,
      };

      const tree = mount(<InfiniteHits {...props} />);

      expect(tree).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> without hits on first page', () => {
      const hits = [];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: { hits },
        hits,
        isFirstPage: true,
        isLastPage: false,
        templateProps: {
          templates: {
            empty: 'empty',
            showMoreText: 'showMoreText',
          },
        },
        cssClasses,
      };

      const tree = mount(<InfiniteHits {...props} />);

      expect(tree).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> without hits on last page', () => {
      const hits = [];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: { hits },
        hits,
        isFirstPage: false,
        isLastPage: true,
        templateProps: {
          templates: {
            empty: 'empty',
            showMoreText: 'showMoreText',
          },
        },
        cssClasses,
      };

      const tree = mount(<InfiniteHits {...props} />);

      expect(tree).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> with "Show previous" button on first page', () => {
      const hits = [
        {
          objectID: 'one',
          foo: 'bar',
        },
        {
          objectID: 'two',
          foo: 'baz',
        },
      ];

      const props = {
        hasShowPrevious: true,
        showPrevious: () => {},
        showMore: () => {},
        results: { hits },
        hits,
        isFirstPage: true,
        isLastPage: false,
        templateProps: {
          templates: {
            item: 'item',
            showMoreText: 'showMoreText',
            showPreviousText: 'showPreviousText',
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
      const hits = [
        {
          objectID: 'one',
          foo: 'bar',
        },
        {
          objectID: 'two',
          foo: 'baz',
        },
      ];

      const props = {
        hasShowPrevious: true,
        showPrevious: () => {},
        showMore: () => {},
        results: { hits },
        hits,
        isFirstPage: false,
        isLastPage: true,
        templateProps: {
          templates: {
            item: 'item',
            showMoreText: 'showMoreText',
            showPreviousText: 'showPreviousText',
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
