import React from 'react';
import { shallow } from 'enzyme';
import expect from 'expect';
import sinon from 'sinon';
import { RawRefinementList as RefinementList } from '../RefinementList';
import RefinementListItem from '../RefinementListItem';

const defaultProps = {
  templateProps: {},
  toggleRefinement: () => {},
};

describe('RefinementList', () => {
  let createURL;

  function shallowRender(extraProps = {}) {
    createURL = sinon.spy();
    const props = {
      ...defaultProps,
      createURL,
      facetValues: [],
      ...extraProps,
    };
    return shallow(React.createElement(RefinementList, props));
  }

  describe('cssClasses', () => {
    it('should add the `list` class to the root element', () => {
      // Given
      const props = {
        ...defaultProps,
        cssClasses: {
          list: 'list',
        },
      };

      // When
      const actual = shallowRender(props);

      // Then
      expect(actual.hasClass('list')).toEqual(true);
    });

    it('should set item classes to the refinements', () => {
      // Given
      const props = {
        ...defaultProps,
        cssClasses: {
          item: 'item',
        },
        facetValues: [{ value: 'foo', isRefined: true }],
      };

      // When
      const actual = shallowRender(props).find(RefinementListItem);

      // Then
      expect(actual.props().itemClassName).toContain('item');
    });

    it('should set active classes to the active refinements', () => {
      // Given
      const props = {
        ...defaultProps,
        cssClasses: {
          active: 'active',
        },
        facetValues: [
          { value: 'foo', isRefined: true },
          { value: 'bar', isRefined: false },
        ],
      };

      // When
      const activeItem = shallowRender(props).find({ isRefined: true });
      const inactiveItem = shallowRender(props).find({ isRefined: false });

      // Then
      expect(activeItem.props().itemClassName).toContain('active');
      expect(inactiveItem.props().itemClassName).not.toContain('active');
    });
  });

  describe('items', () => {
    it('should have the correct names', () => {
      // Given
      const props = {
        ...defaultProps,
        facetValues: [
          { value: 'foo', isRefined: false },
          { value: 'bar', isRefined: false },
        ],
      };

      // When
      const items = shallowRender(props).find(RefinementListItem);
      const firstItem = items.at(0);
      const secondItem = items.at(1);

      // Then
      expect(firstItem.props().facetValueToRefine).toEqual('foo');
      expect(secondItem.props().facetValueToRefine).toEqual('bar');
    });

    it('should correctly set if refined or not', () => {
      // Given
      const props = {
        ...defaultProps,
        facetValues: [
          { value: 'foo', isRefined: false },
          { value: 'bar', isRefined: true },
        ],
      };

      // When
      const items = shallowRender(props).find(RefinementListItem);
      const firstItem = items.at(0);
      const secondItem = items.at(1);

      // Then
      expect(firstItem.props().isRefined).toEqual(false);
      expect(secondItem.props().isRefined).toEqual(true);
    });
  });

  describe('count', () => {
    it('should pass the count to the templateData', () => {
      // Given
      const props = {
        ...defaultProps,
        facetValues: [
          { value: 'foo', count: 42, isRefined: false },
          { value: 'bar', count: 16, isRefined: false },
        ],
      };

      // When
      const items = shallowRender(props).find(RefinementListItem);
      const firstItem = items.at(0);
      const secondItem = items.at(1);

      // Then
      expect(firstItem.props().templateData.count).toEqual(42);
      expect(secondItem.props().templateData.count).toEqual(16);
    });
  });

  describe('showMore', () => {
    it('adds a showMore link when the feature is enabled', () => {
      // Given
      const props = {
        ...defaultProps,
        facetValues: [
          { value: 'foo', isRefined: false },
          { value: 'bar', isRefined: false },
          { value: 'baz', isRefined: false },
        ],
        showMore: true,
        isShowingMore: false,
        canToggleShowMore: true,
      };

      // When
      const root = shallowRender(props);
      const actual = root.find('[templateKey="show-more-inactive"]');

      // Then
      expect(actual).toHaveLength(1);
    });

    it('does not add a showMore link when the feature is disabled', () => {
      // Given
      const props = {
        ...defaultProps,
        facetValues: [
          { value: 'foo', isRefined: false },
          { value: 'bar', isRefined: false },
          { value: 'baz', isRefined: false },
        ],
        showMore: false,
        isShowingMore: false,
      };

      // When
      const root = shallowRender(props);
      const actual = root
        .find('Template')
        .filter({ templateKey: 'show-more-inactive' });

      // Then
      expect(actual).toHaveLength(0);
    });

    it('should displays showLess', () => {
      // Given
      const props = {
        ...defaultProps,
        facetValues: [
          { value: 'foo', isRefined: false },
          { value: 'bar', isRefined: false },
          { value: 'baz', isRefined: false },
        ],
        showMore: true,
        isShowingMore: true,
        canToggleShowMore: true,
      };

      // When
      const root = shallowRender(props);
      const actual = root.find('[templateKey="show-more-active"]');

      // Then
      expect(actual).toHaveLength(1);
    });
  });

  describe('sublist', () => {
    it('should create a subList with the sub values', () => {
      // Given
      const props = {
        ...defaultProps,
        facetValues: [
          {
            value: 'foo',
            data: [
              { value: 'bar', isRefined: false },
              { value: 'baz', isRefined: false },
            ],
            isRefined: false,
          },
        ],
      };

      // When
      const root = shallowRender(props);
      const mainItem = root.find(RefinementListItem).at(0);
      const subList = shallow(mainItem.props().subItems);
      const subItems = subList.find(RefinementListItem);

      // Then
      expect(mainItem.props().facetValueToRefine).toEqual('foo');
      expect(subItems.at(0).props().facetValueToRefine).toEqual('bar');
      expect(subItems.at(1).props().facetValueToRefine).toEqual('baz');
    });

    it('should add depth class for each depth', () => {
      // Given
      const props = {
        ...defaultProps,
        cssClasses: {
          depth: 'depth-',
        },
        facetValues: [
          {
            value: 'foo',
            data: [
              { value: 'bar', isRefined: false },
              { value: 'baz', isRefined: false },
            ],
            isRefined: false,
          },
        ],
      };

      // When
      const root = shallowRender(props);
      const mainItem = root.find(RefinementListItem).at(0);
      const subList = shallow(mainItem.props().subItems);

      // Then
      expect(root.props().className).toContain('depth-0');
      expect(subList.props().className).toContain('depth-1');
    });
  });
});
