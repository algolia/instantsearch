import React from 'react';
import { mount } from 'enzyme';
import InfiniteHits from '../InfiniteHits';

describe('InfiniteHits', () => {
  const cssClasses = {
    root: 'root',
    emptyRoot: 'emptyRoot',
    item: 'item',
    list: 'list',
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
        results: { hits },
        hits,
        isLastPage: false,
        templateProps: {
          templates: {
            item: 'item',
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
        results: { hits },
        hits,
        isLastPage: true,
        templateProps: {
          templates: {
            item: 'item',
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
        results: { hits },
        hits,
        isLastPage: false,
        templateProps: {
          templates: {
            empty: 'empty',
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
        results: { hits },
        hits,
        isLastPage: true,
        templateProps: {
          templates: {
            empty: 'empty',
          },
        },
        cssClasses,
      };

      const tree = mount(<InfiniteHits {...props} />);

      expect(tree).toMatchSnapshot();
    });
  });
});
