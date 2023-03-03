/**
 * @jest-environment jsdom
 */
/** @jsx h */

import { createSingleSearchResponse } from '@instantsearch/mocks';
import { shallow, mount } from '@instantsearch/testutils/enzyme';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import { h } from 'preact';

import { highlight } from '../../../helpers';
import { prepareTemplateProps } from '../../../lib/templating';
import { TAG_REPLACEMENT } from '../../../lib/utils';
import defaultTemplates from '../../../widgets/hits/defaultTemplates';
import Template from '../../Template/Template';
import Hits from '../Hits';

import type { HitsProps } from '../Hits';

describe('Hits', () => {
  const cssClasses = {
    root: 'root',
    emptyRoot: 'emptyRoot',
    item: 'item',
    list: 'list',
  };

  function shallowRender(extraProps: Partial<HitsProps> = {}) {
    const props: HitsProps = {
      cssClasses,
      templateProps: prepareTemplateProps({
        templates: {},
        defaultTemplates,
        templatesConfig: {},
      }),
      results: new SearchResults(new SearchParameters(), [
        createSingleSearchResponse(),
      ]),
      hits: [],
      bindEvent: jest.fn(),
      sendEvent: jest.fn(),
      ...extraProps,
    };

    return shallow(<Hits {...props} />);
  }

  describe('no results', () => {
    it('should use the empty template if no results', () => {
      const props = {
        results: new SearchResults(new SearchParameters(), [
          createSingleSearchResponse({
            hits: [],
          }),
        ]),
        hits: [],
      };

      const wrapper = shallowRender(props);

      expect(wrapper.props().templateKey).toEqual('empty');
    });

    it('should set the empty CSS class when no results', () => {
      const wrapper = shallowRender({
        results: new SearchResults(new SearchParameters(), [
          createSingleSearchResponse({
            hits: [],
          }),
        ]),
      });

      expect(wrapper.props().rootProps.className).toContain('root');
    });
  });

  describe('individual item templates', () => {
    it('should add an item template for each hit', () => {
      const hits = [
        {
          objectID: 'one',
          __position: 1,
          foo: 'bar',
        },
        {
          objectID: 'two',
          __position: 2,
          foo: 'baz',
        },
      ];
      const props = {
        results: new SearchResults(new SearchParameters(), [
          createSingleSearchResponse({
            hits,
          }),
        ]),
        hits,
      };

      const wrapper = shallowRender(props).find(Template);

      expect(wrapper).toHaveLength(2);
      expect(wrapper.at(0).props().templateKey).toEqual('item');
    });

    it('should set the item class to each item', () => {
      const hits = [
        {
          objectID: 'one',
          __position: 1,
          foo: 'bar',
        },
      ];
      const props = {
        results: new SearchResults(new SearchParameters(), [
          createSingleSearchResponse({
            hits,
          }),
        ]),
        hits,
      };

      const wrapper = shallowRender(props).find(Template);

      expect(wrapper.props().rootProps.className).toContain('item');
    });

    it('should wrap the items in a root div element', () => {
      const hits = [
        {
          objectID: 'one',
          __position: 1,
          foo: 'bar',
        },
        {
          objectID: 'two',
          __position: 2,
          foo: 'baz',
        },
      ];

      const props = {
        results: new SearchResults(new SearchParameters(), [
          createSingleSearchResponse({
            hits,
          }),
        ]),
        hits,
      };

      const wrapper = shallowRender(props);

      expect(wrapper.name()).toEqual('div');
      expect(wrapper.props().className).toContain('root');
    });

    it('should pass each result data to each item template', () => {
      const hits = [
        {
          objectID: 'one',
          __position: 1,
          foo: 'bar',
        },
        {
          objectID: 'two',
          __position: 2,
          foo: 'baz',
        },
      ];

      const props = {
        results: new SearchResults(new SearchParameters(), [
          createSingleSearchResponse({
            hits,
          }),
        ]),
        hits,
      };

      const wrapper = shallowRender(props).find({ templateKey: 'item' });

      expect(wrapper.at(0).props().data.foo).toEqual('bar');
      expect(wrapper.at(1).props().data.foo).toEqual('baz');
    });

    it('should add the __hitIndex in the list to each item', () => {
      const hits = [
        {
          objectID: 'one',
          __position: 1,
          foo: 'bar',
        },
        {
          objectID: 'two',
          __position: 2,
          foo: 'baz',
        },
      ];

      const props = {
        results: new SearchResults(new SearchParameters(), [
          createSingleSearchResponse({
            hits,
          }),
        ]),
        hits,
      };

      const wrapper = shallowRender(props).find({ templateKey: 'item' });

      expect(wrapper.at(0).props().data.__hitIndex).toEqual(0);
      expect(wrapper.at(1).props().data.__hitIndex).toEqual(1);
    });

    it('should use the objectID as the DOM key', () => {
      const hits = [
        {
          objectID: 'BAR',
          __position: 1,
          foo: 'bar',
        },
        {
          objectID: 'BAZ',
          __position: 2,
          foo: 'baz',
        },
      ];
      const props = {
        results: new SearchResults(new SearchParameters(), [
          createSingleSearchResponse({
            hits,
          }),
        ]),
        hits,
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
          __position: 1,
        },
        {
          objectID: 'two',
          foo: 'baz',
          __position: 2,
        },
      ];

      const props: HitsProps = {
        results: new SearchResults(new SearchParameters(), [
          createSingleSearchResponse({ hits }),
        ]),
        hits,
        templateProps: prepareTemplateProps({
          templates: {
            item: 'item',
            empty: 'No results',
          },
          defaultTemplates,
          templatesConfig: {},
        }),
        cssClasses,
        bindEvent: jest.fn(),
        sendEvent: jest.fn(),
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
              matchLevel: 'full' as const,
              matchedWords: ['name'],
            },
          },
          __position: 1,
        },
        {
          objectID: 'two',
          name: 'name 2',
          _highlightResult: {
            name: {
              value: `${TAG_REPLACEMENT.highlightPreTag}name 2${TAG_REPLACEMENT.highlightPostTag}`,
              matchLevel: 'full' as const,
              matchedWords: ['name'],
            },
          },
          __position: 2,
        },
      ];

      const props: HitsProps = {
        results: new SearchResults(new SearchParameters(), [
          createSingleSearchResponse({ hits }),
        ]),
        hits,
        templateProps: prepareTemplateProps({
          templates: {
            item(hit) {
              return highlight({
                attribute: 'name',
                hit,
              });
            },
            empty: 'No results',
          },
          defaultTemplates,
          templatesConfig: {},
        }),
        cssClasses,
        bindEvent: jest.fn(),
        sendEvent: jest.fn(),
      };

      const wrapper = mount(<Hits {...props} />);

      expect(wrapper).toMatchSnapshot();
    });
  });
});
