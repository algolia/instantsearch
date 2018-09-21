import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import Hits from '../Hits';
import Template from '../Template';
import { highlight } from '../../helpers';

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
          root: 'root',
          emptyRoot: 'emptyRoot',
        },
      };

      // When
      const actual = shallowRender(props);

      // Then
      expect(actual.props().rootProps.className).toContain('root');
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
          item: 'item',
        },
      };

      // When
      const actual = shallowRender(props).find(Template);

      // Then
      expect(actual.props().rootProps.className).toContain('item');
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
          root: 'root',
        },
      };

      // When
      const actual = shallowRender(props);

      // Then
      expect(actual.name()).toEqual('div');
      expect(actual.props().className).toContain('root');
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

  describe('markup', () => {
    it('should render <Hits />', () => {
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
        cssClasses: {
          root: 'root',
          list: 'list',
          item: 'item',
        },
        templateProps: {
          templates: {
            item: 'item',
          },
        },
      };
      const tree = renderer.create(<Hits {...props} />).toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('should render <Hits /> without highlight function', () => {
      const hits = [
        {
          objectID: 'one',
          name: 'name 1',
          _highlightResult: {
            name: {
              value: '<em>name 1</em>',
            },
          },
        },
        {
          objectID: 'two',
          name: 'name 2',
          _highlightResult: {
            name: {
              value: '<em>name 2</em>',
            },
          },
        },
      ];

      const props = {
        results: { hits },
        hits,
        cssClasses: {
          root: 'root',
          list: 'list',
          item: 'item',
        },
        templateProps: {
          templates: {
            item(hit) {
              return highlight({
                attribute: 'name',
                hit,
              });
            },
          },
        },
      };
      const tree = renderer.create(<Hits {...props} />).toJSON();

      expect(tree).toMatchSnapshot();
    });
  });
});
