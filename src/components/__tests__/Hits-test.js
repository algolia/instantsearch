import React from 'react';
import { shallow } from 'enzyme';
import Hits from '../Hits';
import Template from '../Template';

describe('Hits', () => {
  function shallowRender(extraProps = {}) {
    const props = {
      cssClasses: {},
      templateProps: {},
      ...extraProps,
    };
    return shallow(React.createElement(Hits, props));
  }

  describe('no results', () => {
    it('should use the empty template if no results', () => {
      // Given
      const props = {
        results: {
          hits: [],
        },
        hits: [],
      };

      // When
      const actual = shallowRender(props);

      // Then
      expect(actual.props().templateKey).toEqual('empty');
    });

    it('should set the empty CSS class when no results', () => {
      // Given
      const props = {
        results: {
          hits: [],
        },
        cssClasses: {
          root: 'my_root',
          empty: 'my_empty',
        },
      };

      // When
      const actual = shallowRender(props);

      // Then
      expect(actual.props().rootProps.className).toContain('my_empty');
      expect(actual.props().rootProps.className).toContain('my_root');
    });
  });

  describe('allItems template', () => {
    it('should use the allItems template if defined', () => {
      // Given
      const props = {
        results: {
          hits: [
            {
              objectID: 'one',
              foo: 'bar',
            },
          ],
        },
        templateProps: {
          templates: {
            allItems: 'all items',
          },
        },
      };

      // When
      const actual = shallowRender(props);

      // Then
      expect(actual.props().templateKey).toEqual('allItems');
    });

    it('should set the allItems CSS class to the template', () => {
      // Given
      const props = {
        results: {
          hits: [
            {
              objectID: 'one',
              foo: 'bar',
            },
          ],
        },
        templateProps: {
          templates: {
            allItems: 'all items',
          },
        },
        cssClasses: {
          root: 'my_root',
          allItems: 'my_all_items',
        },
      };

      // When
      const actual = shallowRender(props);

      // Then
      expect(actual.props().rootProps.className).toContain('my_all_items');
      expect(actual.props().rootProps.className).toContain('my_root');
    });

    it('should pass the list of all results to the template', () => {
      // Given
      const results = {
        hits: [
          {
            objectID: 'one',
            foo: 'bar',
          },
        ],
      };
      const props = {
        results,
        templateProps: {
          templates: {
            allItems: 'all items',
          },
        },
      };

      // When
      const actual = shallowRender(props);

      // Then
      expect(actual.props().data).toEqual(results);
    });
  });

  describe('individual item templates', () => {
    it('should add an item template for each hit', () => {
      // Given
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
        templateProps: {
          templates: {
            item: 'one item',
          },
        },
      };

      // When
      const actual = shallowRender(props).find(Template);

      // Then
      expect(actual).toHaveLength(2);
      expect(actual.at(0).props().templateKey).toEqual('item');
    });

    it('should set the item class to each item', () => {
      // Given
      const hits = [
        {
          objectID: 'one',
          foo: 'bar',
        },
      ];
      const props = {
        results: { hits },
        hits,
        templateProps: {
          templates: {
            item: 'one item',
          },
        },
        cssClasses: {
          item: 'my_item',
        },
      };

      // When
      const actual = shallowRender(props).find(Template);

      // Then
      expect(actual.props().rootProps.className).toContain('my_item');
    });

    it('should wrap the items in a root div element', () => {
      // Given
      const props = {
        results: {
          hits: [
            {
              objectID: 'one',
              foo: 'bar',
            },
            {
              objectID: 'two',
              foo: 'baz',
            },
          ],
        },
        templateProps: {
          templates: {
            item: 'one item',
          },
        },
        cssClasses: {
          root: 'my_root',
        },
      };

      // When
      const actual = shallowRender(props);

      // Then
      expect(actual.name()).toEqual('div');
      expect(actual.props().className).toContain('my_root');
    });

    it('should pass each result data to each item template', () => {
      // Given
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
        templateProps: {
          templates: {
            item: 'one item',
          },
        },
      };

      // When
      const actual = shallowRender(props).find({ templateKey: 'item' });

      // Then
      expect(actual.at(0).props().data.foo).toEqual('bar');
      expect(actual.at(1).props().data.foo).toEqual('baz');
    });

    it('should add the __hitIndex in the list to each item', () => {
      // Given
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
        templateProps: {
          templates: {
            item: 'one item',
          },
        },
      };

      // When
      const actual = shallowRender(props).find({ templateKey: 'item' });

      // Then
      expect(actual.at(0).props().data.__hitIndex).toEqual(0);
      expect(actual.at(1).props().data.__hitIndex).toEqual(1);
    });

    it('should use the objectID as the DOM key', () => {
      // Given
      const hits = [
        {
          objectID: 'BAR',
          foo: 'bar',
        },
        {
          objectID: 'BAZ',
          foo: 'baz',
        },
      ];
      const props = {
        results: { hits },
        hits,
        templateProps: {
          templates: {
            item: 'one item',
          },
        },
      };

      // When
      const actual = shallowRender(props).find({ templateKey: 'item' });

      // Then
      expect(actual.at(0).key()).toEqual('BAR');
      expect(actual.at(1).key()).toEqual('BAZ');
    });
  });
});
