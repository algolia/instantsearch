/**
 * @jest-environment jsdom
 */

import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import { wait } from '@instantsearch/testutils/wait';
import { render as preactRender } from 'preact';

import instantsearch from '../../..';
import { createRenderOptions } from '../../../../test/createWidget';
import toggleRefinement from '../toggle-refinement';

import type { ToggleRefinementProps } from '../../../components/ToggleRefinement/ToggleRefinement';
import type { VNode } from 'preact';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('toggleRefinement()', () => {
  describe('Usage', () => {
    it('throws without container', () => {
      expect(() => {
        // @ts-expect-error
        toggleRefinement({ container: undefined });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/toggle-refinement/js/"
`);
    });
  });

  describe('Lifecycle', () => {
    let containerNode: HTMLElement;
    const attribute = 'world!';

    beforeEach(() => {
      render.mockClear();
      containerNode = document.createElement('div');
    });

    describe('render', () => {
      it('calls render with container', async () => {
        const widget = toggleRefinement({
          container: containerNode,
          attribute,
          /* on: true, off: undefined */
        });

        const search = instantsearch({
          indexName: 'test',
          searchClient: createSearchClient(),
        });
        search.start();
        search.addWidgets([widget]);
        await wait(0);

        const firstRender = render.mock.calls[0];

        expect(firstRender[1]).toEqual(containerNode);
      });

      it('understands cssClasses', async () => {
        const widget = toggleRefinement({
          container: containerNode,
          attribute,
          cssClasses: {
            root: 'TEST',
            label: 'TEST-label',
            labelText: 'TEST-labelText',
            checkbox: 'TEST-checkbox',
          },
          /* on: true, off: undefined */
        });

        const search = instantsearch({
          indexName: 'test',
          searchClient: createSearchClient(),
        });
        search.addWidgets([widget]);
        search.start();
        await wait(0);

        const { props } = render.mock
          .calls[0][0] as VNode<ToggleRefinementProps>;

        expect(props.cssClasses).toEqual({
          checkbox: 'ais-ToggleRefinement-checkbox TEST-checkbox',
          label: 'ais-ToggleRefinement-label TEST-label',
          labelText: 'ais-ToggleRefinement-labelText TEST-labelText',
          root: 'ais-ToggleRefinement TEST',
        });
      });

      it('with facet values', async () => {
        const widget = toggleRefinement({
          container: containerNode,
          attribute,
          /* on: true, off: undefined */
        });

        const search = instantsearch({
          indexName: 'test',
          searchClient: createSearchClient({
            search: (queries) =>
              Promise.resolve({
                results: queries.map(() =>
                  createSingleSearchResponse({
                    facets: {
                      [attribute]: { true: 2, false: 1 },
                    },
                  })
                ),
              }),
          }),
        });
        search.addWidgets([widget]);
        search.start();
        await wait(0);

        const { props } = render.mock
          .calls[0][0] as VNode<ToggleRefinementProps>;

        expect(props.currentRefinement).toEqual({
          count: 2,
          isRefined: false,
          name: 'world!',
          offFacetValue: {
            count: 3,
            isRefined: false,
          },
          onFacetValue: {
            count: 2,
            isRefined: false,
          },
        });
      });

      it('supports negative numeric off or on values', async () => {
        const widget = toggleRefinement({
          container: containerNode,
          attribute,
          off: -2,
          on: 5,
        });

        const search = instantsearch({
          indexName: 'test',
          searchClient: createSearchClient({
            search: (queries) =>
              Promise.resolve({
                results: queries.map(() =>
                  createSingleSearchResponse({
                    facets: {
                      [attribute]: { '-2': 2, 5: 1 },
                    },
                  })
                ),
              }),
          }),
        });
        search.addWidgets([widget]);
        search.start();
        await wait(0);

        const { props } = render.mock
          .calls[0][0] as VNode<ToggleRefinementProps>;

        expect(props.currentRefinement).toEqual({
          count: 1,
          isRefined: false,
          name: 'world!',
          offFacetValue: {
            count: 2,
            isRefined: true,
          },
          onFacetValue: {
            count: 1,
            isRefined: false,
          },
        });

        widget
          .getWidgetRenderState(createRenderOptions({ helper: search.helper! }))
          .refine({ isRefined: true });

        expect(
          // @ts-expect-error we are using a numeric facet, even if the type only allows strings
          search.helper!.state.isDisjunctiveFacetRefined(attribute, 5)
        ).toBe(false);
        expect(
          search.helper!.state.isDisjunctiveFacetRefined(attribute, '\\-2')
        ).toBe(true);
      });

      it('without facet values', async () => {
        const widget = toggleRefinement({
          container: containerNode,
          attribute,
          /* on: true, off: undefined */
        });

        const search = instantsearch({
          indexName: 'test',
          searchClient: createSearchClient({
            search: (queries) =>
              Promise.resolve({
                results: queries.map(() =>
                  createSingleSearchResponse({
                    facets: {
                      [attribute]: {},
                    },
                  })
                ),
              }),
          }),
        });
        search.addWidgets([widget]);
        search.start();
        await wait(0);

        const { props } = render.mock
          .calls[0][0] as VNode<ToggleRefinementProps>;

        expect(props.currentRefinement).toEqual({
          count: null,
          isRefined: false,
          name: 'world!',
          offFacetValue: {
            count: 0,
            isRefined: false,
          },
          onFacetValue: {
            count: null,
            isRefined: false,
          },
        });
      });

      it('when refined', async () => {
        const widget = toggleRefinement({
          container: containerNode,
          attribute,
          /* on: true, off: undefined */
        });

        const search = instantsearch({
          indexName: 'test',
          initialUiState: {
            test: {
              toggle: {
                [attribute]: true,
              },
            },
          },
          searchClient: createSearchClient({
            search(queries) {
              return Promise.resolve({
                results: queries.map(() =>
                  createSingleSearchResponse({
                    facets: {
                      [attribute]: {
                        true: 2,
                        false: 1,
                      },
                    },
                  })
                ),
              });
            },
          }),
        });
        search.start();
        search.addWidgets([widget]);
        await wait(0);

        const firstRender = render.mock
          .calls[0][0] as VNode<ToggleRefinementProps>;
        const secondRender = render.mock
          .calls[0][0] as VNode<ToggleRefinementProps>;

        expect(firstRender.props.currentRefinement).toEqual({
          count: 3,
          isRefined: true,
          name: 'world!',
          offFacetValue: {
            count: 3,
            isRefined: false,
          },
          onFacetValue: {
            count: 2,
            isRefined: true,
          },
        });

        expect(secondRender.props.currentRefinement).toEqual(
          firstRender.props.currentRefinement
        );
      });

      it('using props.refine', async () => {
        const widget = toggleRefinement({
          container: containerNode,
          attribute,
          /* on: true, off: undefined */
        });

        const searchClient = createSearchClient({
          search: (queries) => {
            return Promise.resolve({
              results: queries.map(() =>
                createSingleSearchResponse({
                  facets: {
                    [attribute]: {
                      true: 2,
                      false: 1,
                    },
                  },
                })
              ),
            });
          },
        });

        const searchSpy = jest.spyOn(searchClient, 'search');

        const search = instantsearch({
          indexName: 'test',
          searchClient,
        });
        search.start();
        search.addWidgets([widget]);
        await wait(0);

        expect(searchSpy).toHaveBeenCalledTimes(1);

        const firstRender = render.mock
          .calls[0][0] as VNode<ToggleRefinementProps>;

        expect(firstRender.props.currentRefinement).toEqual({
          count: 2,
          isRefined: false,
          name: 'world!',
          offFacetValue: {
            count: 3,
            isRefined: false,
          },
          onFacetValue: {
            count: 2,
            isRefined: false,
          },
        });

        expect(typeof firstRender.props.refine).toEqual('function');
        firstRender.props.refine();
        await wait(0);

        expect(searchSpy).toHaveBeenCalledTimes(2);

        const secondRender = render.mock
          .calls[1][0] as VNode<ToggleRefinementProps>;

        expect(secondRender.props.currentRefinement).toEqual({
          count: 3,
          isRefined: true,
          name: 'world!',
          offFacetValue: {
            count: 3,
            isRefined: false,
          },
          onFacetValue: {
            count: 2,
            isRefined: true,
          },
        });
      });
    });
  });
});
