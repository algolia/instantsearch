/* eslint-env mocha */

import React from 'react';
import {shallow} from 'enzyme';
import expect from 'expect';
import RefinementList from '../RefinementList';
import RefinementListItem from '../RefinementListItem';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('RefinementList', () => {
  function shallowRender(extraProps: {}) {
    let props = {
      createURL: () => 'url',
      facetValues: [],
      ...extraProps
    };
    return shallow(React.createElement(RefinementList, props));
  }

  describe('cssClasses', () => {
    it('should add the `list` class to the root element', () => {
      // Given
      let props = {
        cssClasses: {
          list: 'list'
        }
      };

      // When
      let actual = shallowRender(props);

      // Then
      expect(actual.hasClass('list')).toEqual(true);
    });

    it('should set item classes to the refinements', () => {
      // Given
      let props = {
        cssClasses: {
          item: 'item'
        },
        facetValues: [
          {name: 'foo', isRefined: true}
        ]
      };

      // When
      let actual = shallowRender(props).find(RefinementListItem);

      // Then
      expect(actual.props().itemClassName).toContain('item');
    });

    it('should set active classes to the active refinements', () => {
      // Given
      let props = {
        cssClasses: {
          active: 'active'
        },
        facetValues: [
          {name: 'foo', isRefined: true},
          {name: 'bar', isRefined: false}
        ]
      };

      // When
      let activeItem = shallowRender(props).find({isRefined: true});
      let inactiveItem = shallowRender(props).find({isRefined: false});

      // Then
      expect(activeItem.props().itemClassName).toContain('active');
      expect(inactiveItem.props().itemClassName).toNotContain('active');
    });
  });

  describe('items', () => {
    it('should have the correct names', () => {
      // Given
      let props = {
        facetValues: [
          {name: 'foo', isRefined: false},
          {name: 'bar', isRefined: false}
        ]
      };

      // When
      let items = shallowRender(props).find(RefinementListItem);
      let firstItem = items.at(0);
      let secondItem = items.at(1);

      // Then
      expect(firstItem.props().facetValueToRefine).toEqual('foo');
      expect(secondItem.props().facetValueToRefine).toEqual('bar');
    });

    it('should correctly set if refined or not', () => {
      // Given
      let props = {
        facetValues: [
          {name: 'foo', isRefined: false},
          {name: 'bar', isRefined: true}
        ]
      };

      // When
      let items = shallowRender(props).find(RefinementListItem);
      let firstItem = items.at(0);
      let secondItem = items.at(1);

      // Then
      expect(firstItem.props().isRefined).toEqual(false);
      expect(secondItem.props().isRefined).toEqual(true);
    });
  });

  describe('count', () => {
    it('should pass the count to the templateData', () => {
      // Given
      let props = {
        facetValues: [
          {name: 'foo', count: 42},
          {name: 'bar', count: 16}
        ]
      };

      // When
      let items = shallowRender(props).find(RefinementListItem);
      let firstItem = items.at(0);
      let secondItem = items.at(1);

      // Then
      expect(firstItem.props().templateData.count).toEqual(42);
      expect(secondItem.props().templateData.count).toEqual(16);
    });
  });

  describe('showMore', () => {
    it('displays a number of items equal to the limit when showMore: false', () => {
      // Given
      let props = {
        facetValues: [
          {name: 'foo'},
          {name: 'bar'},
          {name: 'baz'}
        ],
        showMore: false,
        limitMin: 2
      };

      // When
      let actual = shallowRender(props).find(RefinementListItem);

      // Then
      expect(actual.length).toEqual(2);
    });

    it('displays a number of items equal to the limit when showMore: true but not enabled', () => {
      // Given
      let props = {
        facetValues: [
          {name: 'foo'},
          {name: 'bar'},
          {name: 'baz'}
        ],
        showMore: true,
        limitMin: 2,
        limitMax: 3
      };

      // When
      let actual = shallowRender(props).find(RefinementListItem);

      // Then
      expect(actual.length).toEqual(2);
    });

    it('displays a number of items equal to the showMore limit when showMore: true and enabled', () => {
      // Given
      let props = {
        facetValues: [
          {name: 'foo'},
          {name: 'bar'},
          {name: 'baz'}
        ],
        limitMin: 2,
        limitMax: 3,
        showMore: true
      };

      // When
      let root = shallowRender(props);
      root.setState({isShowMoreOpen: true});
      let actual = root.find(RefinementListItem);

      // Then
      expect(actual.length).toEqual(3);
    });

    it('adds a showMore link when the feature is enabled', () => {
      // Given
      let props = {
        facetValues: [
          {name: 'foo'},
          {name: 'bar'},
          {name: 'baz'}
        ],
        showMore: true,
        limitMin: 2,
        limitMax: 3
      };

      // When
      let root = shallowRender(props);
      let actual = root.find('Template').filter({templateKey: 'show-more-inactive'});

      // Then
      expect(actual.length).toEqual(1);
    });

    it('does not add a showMore link when the feature is disabled', () => {
      // Given
      let props = {
        facetValues: [
          {name: 'foo'},
          {name: 'bar'},
          {name: 'baz'}
        ],
        showMore: false,
        limitMin: 2,
        limitMax: 3
      };

      // When
      let root = shallowRender(props);
      let actual = root.find('Template').filter({templateKey: 'show-more-inactive'});

      // Then
      expect(actual.length).toEqual(0);
    });

    it('changing the state will toggle the number of items displayed', () => {
      // Given
      let props = {
        facetValues: [
          {name: 'foo'},
          {name: 'bar'},
          {name: 'baz'}
        ],
        limitMin: 2,
        limitMax: 3,
        showMore: true
      };

      // When
      let root = shallowRender(props);

      // Then: Not opened, initial number displayed
      expect(root.find(RefinementListItem).length).toEqual(2);

      // Then: Toggling the state, display the limitMax
      root.setState({isShowMoreOpen: true});
      expect(root.find(RefinementListItem).length).toEqual(3);

      // Then: Toggling the state again, back to the limitMin
      root.setState({isShowMoreOpen: false});
      expect(root.find(RefinementListItem).length).toEqual(2);
    });
  });

  describe('sublist', () => {
    it('should create a subList with the sub values', () => {
      // Given
      let props = {
        facetValues: [
          {
            name: 'foo',
            data: [
              {name: 'bar'},
              {name: 'baz'}
            ]
          }
        ]
      };

      // When
      let root = shallowRender(props);
      let mainItem = root.find(RefinementListItem).at(0);
      let subList = shallow(mainItem.props().subItems);
      let subItems = subList.find(RefinementListItem);

      // Then
      expect(mainItem.props().facetValueToRefine).toEqual('foo');
      expect(subItems.at(0).props().facetValueToRefine).toEqual('bar');
      expect(subItems.at(1).props().facetValueToRefine).toEqual('baz');
    });

    it('should add depth class for each depth', () => {
      // Given
      let props = {
        cssClasses: {
          depth: 'depth-'
        },
        facetValues: [
          {
            name: 'foo',
            data: [
              {name: 'bar'},
              {name: 'baz'}
            ]
          }
        ]
      };

      // When
      let root = shallowRender(props);
      let mainItem = root.find(RefinementListItem).at(0);
      let subList = shallow(mainItem.props().subItems);

      // Then
      expect(root.props().className).toContain('depth-0');
      expect(subList.props().className).toContain('depth-1');
    });
  });
});

