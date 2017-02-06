/* eslint-env mocha */

import React from 'react';
import {shallow} from 'enzyme';
import expect from 'expect';
import sinon from 'sinon';

import {RawRefinementList as RefinementList} from '../RefinementList';
import RefinementListItem from '../RefinementListItem';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('RefinementList', () => {
  let createURL;

  function shallowRender(extraProps = {}) {
    createURL = sinon.spy();
    const props = {
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
        cssClasses: {
          item: 'item',
        },
        facetValues: [
          {name: 'foo', isRefined: true},
        ],
      };

      // When
      const actual = shallowRender(props).find(RefinementListItem);

      // Then
      expect(actual.props().itemClassName).toContain('item');
    });

    it('should set active classes to the active refinements', () => {
      // Given
      const props = {
        cssClasses: {
          active: 'active',
        },
        facetValues: [
          {name: 'foo', isRefined: true},
          {name: 'bar', isRefined: false},
        ],
      };

      // When
      const activeItem = shallowRender(props).find({isRefined: true});
      const inactiveItem = shallowRender(props).find({isRefined: false});

      // Then
      expect(activeItem.props().itemClassName).toContain('active');
      expect(inactiveItem.props().itemClassName).toNotContain('active');
    });
  });

  describe('items', () => {
    it('should have the correct names', () => {
      // Given
      const props = {
        facetValues: [
          {name: 'foo', isRefined: false},
          {name: 'bar', isRefined: false},
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

    it('understands attributeNameKey', () => {
      // Given
      const props = {
        facetValues: [{name: 'no', youpiName: 'hello'}],
        attributeNameKey: 'youpiName',
      };

      // When
      const items = shallowRender(props).find(RefinementListItem);
      const item = items.at(0);

      // Then
      expect(item.props().facetValueToRefine).toEqual('hello');
      expect(createURL.calledOnce).toBe(true);
      expect(createURL.args[0][0]).toBe('hello');
    });

    it('should correctly set if refined or not', () => {
      // Given
      const props = {
        facetValues: [
          {name: 'foo', isRefined: false},
          {name: 'bar', isRefined: true},
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
        facetValues: [
          {name: 'foo', count: 42},
          {name: 'bar', count: 16},
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
    it('displays a number of items equal to the limit when showMore: false', () => {
      // Given
      const props = {
        facetValues: [
          {name: 'foo'},
          {name: 'bar'},
          {name: 'baz'},
        ],
        showMore: false,
        limitMin: 2,
      };

      // When
      const actual = shallowRender(props).find(RefinementListItem);

      // Then
      expect(actual.length).toEqual(2);
    });

    it('displays a number of items equal to the limit when showMore: true but not enabled', () => {
      // Given
      const props = {
        facetValues: [
          {name: 'foo'},
          {name: 'bar'},
          {name: 'baz'},
        ],
        showMore: true,
        limitMin: 2,
        limitMax: 3,
      };

      // When
      const actual = shallowRender(props).find(RefinementListItem);

      // Then
      expect(actual.length).toEqual(2);
    });

    it('displays a number of items equal to the showMore limit when showMore: true and enabled', () => {
      // Given
      const props = {
        facetValues: [
          {name: 'foo'},
          {name: 'bar'},
          {name: 'baz'},
        ],
        limitMin: 2,
        limitMax: 3,
        showMore: true,
      };

      // When
      const root = shallowRender(props);
      root.setState({isShowMoreOpen: true});
      const actual = root.find(RefinementListItem);

      // Then
      expect(actual.length).toEqual(3);
    });

    it('adds a showMore link when the feature is enabled', () => {
      // Given
      const props = {
        facetValues: [
          {name: 'foo'},
          {name: 'bar'},
          {name: 'baz'},
        ],
        showMore: true,
        limitMin: 2,
        limitMax: 3,
      };

      // When
      const root = shallowRender(props);
      const actual = root.find('[templateKey="show-more-inactive"]');

      // Then
      expect(actual.length).toEqual(1);
    });

    it('does not add a showMore link when the feature is disabled', () => {
      // Given
      const props = {
        facetValues: [
          {name: 'foo'},
          {name: 'bar'},
          {name: 'baz'},
        ],
        showMore: false,
        limitMin: 2,
        limitMax: 3,
      };

      // When
      const root = shallowRender(props);
      const actual = root.find('Template').filter({templateKey: 'show-more-inactive'});

      // Then
      expect(actual.length).toEqual(0);
    });

    it('no showMore when: state = open -> values change -> values <= limitMin ', () => {
      // Given
      const props = {
        facetValues: [
          {name: 'foo'},
          {name: 'bar'},
          {name: 'baz'},
        ],
        showMore: true,
        limitMin: 2,
        limitMax: 5,
      };

      // When
      const root = shallowRender(props);
      root.instance().handleClickShowMore();
      root.setProps({facetValues: props.facetValues.slice(2)});

      // Then
      expect(root.find({templateKey: 'show-more-active'}).length).toEqual(0);
    });

    it('does not add a showMore link when the facet values length is equal to the minLimit', () => {
      // Given
      const props = {
        facetValues: [
          {name: 'foo'},
          {name: 'bar'},
          {name: 'baz'},
        ],
        showMore: true,
        limitMin: 3,
        limitMax: 4,
      };

      // When
      const root = shallowRender(props);
      const actual = root.find('Template').filter({templateKey: 'show-more-inactive'});

      // Then
      expect(actual.length).toEqual(0);
    });

    it('changing the state will toggle the number of items displayed', () => {
      // Given
      const props = {
        facetValues: [
          {name: 'foo'},
          {name: 'bar'},
          {name: 'baz'},
        ],
        limitMin: 2,
        limitMax: 3,
        showMore: true,
      };

      // When
      const root = shallowRender(props);

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
      const props = {
        facetValues: [
          {
            name: 'foo',
            data: [
              {name: 'bar'},
              {name: 'baz'},
            ],
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
        cssClasses: {
          depth: 'depth-',
        },
        facetValues: [
          {
            name: 'foo',
            data: [
              {name: 'bar'},
              {name: 'baz'},
            ],
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
