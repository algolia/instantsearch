import React from 'react';
import renderer from 'react-test-renderer';
import InfiniteHits from '../InfiniteHits';

describe('InfiniteHits', () => {
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
        results: { hits },
        hits,
        isLastPage: false,
        cssClasses: {
          root: 'root',
          emptyRoot: 'emptyRoot',
          list: 'list',
          item: 'item',
          loadMore: 'loadMore',
          disabledLoadMore: 'disabledLoadMore',
        },
        templateProps: {
          templates: {
            item: 'item',
          },
        },
      };
      const tree = renderer.create(<InfiniteHits {...props} />).toJSON();

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
        results: { hits },
        hits,
        isLastPage: true,
        cssClasses: {
          root: 'root',
          emptyRoot: 'emptyRoot',
          list: 'list',
          item: 'item',
          loadMore: 'loadMore',
          disabledLoadMore: 'disabledLoadMore',
        },
        templateProps: {
          templates: {
            item: 'item',
          },
        },
      };
      const tree = renderer.create(<InfiniteHits {...props} />).toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> without hits on first page', () => {
      const hits = [];

      const props = {
        results: { hits },
        hits,
        isLastPage: false,
        cssClasses: {
          root: 'root',
          emptyRoot: 'emptyRoot',
          list: 'list',
          item: 'item',
          loadMore: 'loadMore',
          disabledLoadMore: 'disabledLoadMore',
        },
        templateProps: {
          templates: {
            empty: 'empty',
          },
        },
      };
      const tree = renderer.create(<InfiniteHits {...props} />).toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('should render <InfiniteHits /> without hits on last page', () => {
      const hits = [];

      const props = {
        results: { hits },
        hits,
        isLastPage: true,
        cssClasses: {
          root: 'root',
          emptyRoot: 'emptyRoot',
          list: 'list',
          item: 'item',
          loadMore: 'loadMore',
          disabledLoadMore: 'disabledLoadMore',
        },
        templateProps: {
          templates: {
            empty: 'empty',
          },
        },
      };
      const tree = renderer.create(<InfiniteHits {...props} />).toJSON();

      expect(tree).toMatchSnapshot();
    });
  });
});
