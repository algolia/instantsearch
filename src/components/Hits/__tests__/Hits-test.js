/** @jsx h */

import { h } from 'preact';
import { shallow, mount } from 'enzyme';
import { highlight } from '../../../helpers';
import { TAG_REPLACEMENT } from '../../../lib/utils';
import Template from '../../Template/Template';
import Hits from '../Hits';

describe('Hits', () => {
  const cssClasses = {
    root: 'root',
    emptyRoot: 'emptyRoot',
    item: 'item',
    list: 'list',
  };

  function shallowRender(extraProps = {}) {
    const props = {
      cssClasses,
      templateProps: {},
      ...extraProps,
    };

    return shallow(<Hits {...props} />);
  }

  describe('no results', () => {
    it('should use the empty template if no results', () => {
      const props = {
        results: {
          hits: [],
        },
        hits: [],
        cssClasses,
      };

      const wrapper = shallowRender(props);

      expect(wrapper.props().templateKey).toEqual('empty');
    });

    it('should set the empty CSS class when no results', () => {
      const props = {
        results: {
          hits: [],
        },
        cssClasses,
      };

      const wrapper = shallowRender(props);

      expect(wrapper.props().rootProps.className).toContain('root');
    });
  });

  describe('individual item templates', () => {
    it('should add an item template for each hit', () => {
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
        cssClasses,
      };

      const wrapper = shallowRender(props).find(Template);

      expect(wrapper).toHaveLength(2);
      expect(wrapper.at(0).props().templateKey).toEqual('item');
    });

    it('should set the item class to each item', () => {
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
        cssClasses,
      };

      const wrapper = shallowRender(props).find(Template);

      expect(wrapper.props().rootProps.className).toContain('item');
    });

    it('should wrap the items in a root div element', () => {
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
        cssClasses,
      };

      const wrapper = shallowRender(props);

      expect(wrapper.name()).toEqual('div');
      expect(wrapper.props().className).toContain('root');
    });

    it('should pass each result data to each item template', () => {
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
        cssClasses,
      };

      const wrapper = shallowRender(props).find({ templateKey: 'item' });

      expect(wrapper.at(0).props().data.foo).toEqual('bar');
      expect(wrapper.at(1).props().data.foo).toEqual('baz');
    });

    it('should add the __hitIndex in the list to each item', () => {
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
        cssClasses,
      };

      const wrapper = shallowRender(props).find({ templateKey: 'item' });

      expect(wrapper.at(0).props().data.__hitIndex).toEqual(0);
      expect(wrapper.at(1).props().data.__hitIndex).toEqual(1);
    });

    it('should use the objectID as the DOM key', () => {
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
        cssClasses,
      };

      const wrapper = shallowRender(props).find({ templateKey: 'item' });

      expect(wrapper.at(0).key()).toEqual('BAR');
      expect(wrapper.at(1).key()).toEqual('BAZ');
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
        templateProps: {
          templates: {
            item: 'item',
          },
        },
        cssClasses,
      };

      const wrapper = mount(<Hits {...props} />);

      expect(wrapper).toMatchSnapshot();
    });

    it('should render <Hits /> without highlight function', () => {
      const hits = [
        {
          objectID: 'one',
          name: 'name 1',
          _highlightResult: {
            name: {
              value: `${TAG_REPLACEMENT.highlightPreTag}name 1${TAG_REPLACEMENT.highlightPostTag}`,
            },
          },
        },
        {
          objectID: 'two',
          name: 'name 2',
          _highlightResult: {
            name: {
              value: `${TAG_REPLACEMENT.highlightPreTag}name 2${TAG_REPLACEMENT.highlightPostTag}`,
            },
          },
        },
      ];

      const props = {
        results: { hits },
        hits,
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
        cssClasses,
      };

      const wrapper = mount(<Hits {...props} />);

      expect(wrapper).toMatchSnapshot();
    });
  });
});
