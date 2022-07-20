/**
 * @jest-environment jsdom
 */
/** @jsx h */

import { h } from 'preact';
import { shallow, mount } from '../../../../test/utils/enzyme';
import { highlight } from '../../../helpers';
import { prepareTemplateProps, TAG_REPLACEMENT } from '../../../lib/utils';
import Template from '../../Template/Template';
import type { HitsProps } from '../Hits';
import Hits from '../Hits';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import defaultTemplates from '../../../widgets/hits/defaultTemplates';
import { render } from '@testing-library/preact';

describe('Hits', () => {
  const cssClasses = {
    root: 'root',
    emptyRoot: 'emptyRoot',
    item: 'item',
    list: 'list',
  };

  function createProps(props: Partial<HitsProps>) {
    return {
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
      ...props,
    };
  }

  function shallowRender(extraProps: Partial<HitsProps> = {}) {
    const props = createProps(extraProps);

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

    it('renders component with custom `html` templates (with hits)', () => {
      const hits = [
        {
          objectID: '1',
          name: 'Apple iPhone smartphone',
          description: 'A smartphone by Apple.',
          _highlightResult: {
            name: {
              value: `Apple iPhone ${TAG_REPLACEMENT.highlightPreTag}smartphone`,
              matchLevel: 'full' as const,
              matchedWords: ['smartphone'],
            },
          },
          _snippetResult: {
            description: {
              value: `A ${TAG_REPLACEMENT.highlightPreTag}smartphone${TAG_REPLACEMENT.highlightPostTag} by Apple.`,
              matchLevel: 'full' as const,
              matchedWords: ['smartphone'],
            },
          },
          __position: 1,
        },
        {
          objectID: '2',
          name: 'Samsung Galaxy smartphone',
          description: 'A smartphone by Samsung.',
          _highlightResult: {
            name: {
              value: `Samsung Galaxy ${TAG_REPLACEMENT.highlightPreTag}smartphone${TAG_REPLACEMENT.highlightPostTag}`,
              matchLevel: 'full' as const,
              matchedWords: ['smartphone'],
            },
          },
          _snippetResult: {
            description: {
              value: `A ${TAG_REPLACEMENT.highlightPreTag}smartphone${TAG_REPLACEMENT.highlightPostTag} by Samsung.`,
              matchLevel: 'full' as const,
              matchedWords: ['smartphone'],
            },
          },
          __position: 2,
        },
      ];

      const props: HitsProps = {
        results: new SearchResults(new SearchParameters(), [
          createSingleSearchResponse({ hits, query: 'smartphone' }),
        ]),
        hits,
        templateProps: prepareTemplateProps({
          defaultTemplates,
          templatesConfig: {},
        }),
        cssClasses,
      };

      const { container } = render(
        <Hits
          {...props}
          templateProps={{
            ...props.templateProps,
            templates: {
              empty({ query }, { html }) {
                return html`<p>No results for <q>${query}</q></p>`;
              },
              item(hit, { html, components }) {
                return html`
                  <h2>${components.Highlight({ hit, attribute: 'name' })}</h2>
                  <h3>
                    ${components.ReverseHighlight({ hit, attribute: 'name' })}
                  </h3>
                  <p>
                    ${components.Snippet({ hit, attribute: 'description' })}
                  </p>
                  <p>
                    ${components.ReverseSnippet({
                      hit,
                      attribute: 'description',
                    })}
                  </p>
                `;
              },
            },
          }}
        />
      );

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="root"
  >
    <ol
      class="list"
    >
      <li
        class="item"
      >
        <h2>
          <span
            class="ais-Highlight"
          >
            <span
              class="ais-Highlight-nonHighlighted"
            >
              Apple iPhone 
            </span>
            <mark
              class="ais-Highlight-highlighted"
            >
              smartphone
            </mark>
            <span
              class="ais-Highlight-nonHighlighted"
            />
          </span>
        </h2>
        <h3>
          <span
            class="ais-ReverseHighlight"
          >
            <mark
              class="ais-ReverseHighlight-highlighted"
            >
              Apple iPhone 
            </mark>
            <span
              class="ais-ReverseHighlight-nonHighlighted"
            >
              smartphone
            </span>
            <mark
              class="ais-ReverseHighlight-highlighted"
            />
          </span>
        </h3>
        <p>
          <span
            class="ais-Snippet"
          >
            <span
              class="ais-Snippet-nonHighlighted"
            >
              A 
            </span>
            <mark
              class="ais-Snippet-highlighted"
            >
              smartphone
            </mark>
            <span
              class="ais-Snippet-nonHighlighted"
            >
               by Apple.
            </span>
          </span>
        </p>
        <p>
          <span
            class="ais-ReverseSnippet"
          >
            <mark
              class="ais-ReverseSnippet-highlighted"
            >
              A 
            </mark>
            <span
              class="ais-ReverseSnippet-nonHighlighted"
            >
              smartphone
            </span>
            <mark
              class="ais-ReverseSnippet-highlighted"
            >
               by Apple.
            </mark>
          </span>
        </p>
      </li>
      <li
        class="item"
      >
        <h2>
          <span
            class="ais-Highlight"
          >
            <span
              class="ais-Highlight-nonHighlighted"
            >
              Samsung Galaxy 
            </span>
            <mark
              class="ais-Highlight-highlighted"
            >
              smartphone
            </mark>
          </span>
        </h2>
        <h3>
          <span
            class="ais-ReverseHighlight"
          >
            <mark
              class="ais-ReverseHighlight-highlighted"
            >
              Samsung Galaxy 
            </mark>
            <span
              class="ais-ReverseHighlight-nonHighlighted"
            >
              smartphone
            </span>
          </span>
        </h3>
        <p>
          <span
            class="ais-Snippet"
          >
            <span
              class="ais-Snippet-nonHighlighted"
            >
              A 
            </span>
            <mark
              class="ais-Snippet-highlighted"
            >
              smartphone
            </mark>
            <span
              class="ais-Snippet-nonHighlighted"
            >
               by Samsung.
            </span>
          </span>
        </p>
        <p>
          <span
            class="ais-ReverseSnippet"
          >
            <mark
              class="ais-ReverseSnippet-highlighted"
            >
              A 
            </mark>
            <span
              class="ais-ReverseSnippet-nonHighlighted"
            >
              smartphone
            </span>
            <mark
              class="ais-ReverseSnippet-highlighted"
            >
               by Samsung.
            </mark>
          </span>
        </p>
      </li>
    </ol>
  </div>
</div>
`);
    });

    it('renders component with custom `html` templates (without hits)', () => {
      const props: HitsProps = {
        results: new SearchResults(new SearchParameters(), [
          createSingleSearchResponse({ hits: [], query: 'smartphone' }),
        ]),
        hits: [],
        templateProps: prepareTemplateProps({
          defaultTemplates,
          templatesConfig: {},
        }),
        cssClasses,
      };

      const { container } = render(
        <Hits
          {...props}
          templateProps={{
            ...props.templateProps,
            templates: {
              empty({ query }, { html }) {
                return html`<p>No results for <q>${query}</q></p>`;
              },
              item(hit, { html }) {
                return html`<pre>${JSON.stringify(hit)}</pre>`;
              },
            },
          }}
        />
      );

      expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="root emptyRoot"
  >
    <p>
      No results for 
      <q>
        smartphone
      </q>
    </p>
  </div>
</div>
`);
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
      };

      const wrapper = mount(<Hits {...props} />);

      expect(wrapper).toMatchSnapshot();
    });
  });
});
