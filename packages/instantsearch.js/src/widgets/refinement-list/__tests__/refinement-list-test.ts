/**
 * @jest-environment jsdom
 */

import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import { wait } from '@instantsearch/testutils/wait';
import { render as originalRender } from 'preact';

import instantsearch from '../../../index.es';
import refinementList from '../refinement-list';

import type { RefinementListProps } from '../../../components/RefinementList/RefinementList';
import type { RefinementListTemplates } from '../refinement-list';
import type { VNode } from 'preact';

const render = castToJestMock(originalRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('refinementList()', () => {
  let container: HTMLElement;
  const searchClient = createSearchClient({
    search() {
      return Promise.resolve({
        results: [
          createSingleSearchResponse({
            facets: {
              attribute: {
                foo: 1,
                bar: 2,
              },
            },
          }),
        ],
      });
    },
  });

  beforeEach(() => {
    render.mockClear();

    container = document.createElement('div');
  });

  describe('instantiated with wrong parameters', () => {
    it('should fail if no container', () => {
      expect(() => {
        // @ts-expect-error
        refinementList({ attribute: 'foo' });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/refinement-list/js/"
`);
    });
  });

  describe('render', () => {
    describe('cssClasses', () => {
      it('should call the component with the correct classes', async () => {
        const cssClasses = {
          root: ['root', 'cx'],
          noRefinementRoot: 'noRefinementRoot',
          list: 'list',
          item: 'item',
          selectedItem: 'selectedItem',
          searchBox: 'searchBox',
          label: 'label',
          checkbox: 'checkbox',
          labelText: 'labelText',
          count: 'count',
          noResults: 'noResults',
          showMore: 'showMore',
          disabledShowMore: 'disabledShowMore',
          searchableRoot: 'searchableRoot',
          searchableForm: 'searchableForm',
          searchableInput: 'searchableInput',
          searchableSubmit: 'searchableSubmit',
          searchableSubmitIcon: 'searchableSubmitIcon',
          searchableReset: 'searchableReset',
          searchableResetIcon: 'searchableResetIcon',
          searchableLoadingIndicator: 'searchableLoadingIndicator',
          searchableLoadingIcon: 'searchableLoadingIcon',
        };

        const widget = refinementList({
          container,
          attribute: 'attribute',
          cssClasses,
        });

        const search = instantsearch({
          indexName: 'test',
          searchClient,
        });
        search.start();
        search.addWidgets([widget]);
        await wait(0);

        const { props } = render.mock.calls[0][0] as VNode<
          RefinementListProps<RefinementListTemplates>
        >;

        const actual = (props as RefinementListProps<RefinementListTemplates>)
          .cssClasses;

        expect(actual.root).toMatchInlineSnapshot(
          `"ais-RefinementList root cx"`
        );
        expect(actual.noRefinementRoot).toMatchInlineSnapshot(
          `"ais-RefinementList--noRefinement noRefinementRoot"`
        );
        expect(actual.list).toMatchInlineSnapshot(
          `"ais-RefinementList-list list"`
        );
        expect(actual.item).toMatchInlineSnapshot(
          `"ais-RefinementList-item item"`
        );
        expect(actual.selectedItem).toMatchInlineSnapshot(
          `"ais-RefinementList-item--selected selectedItem"`
        );
        expect(actual.searchBox).toMatchInlineSnapshot(
          `"ais-RefinementList-searchBox searchBox"`
        );
        expect(actual.label).toMatchInlineSnapshot(
          `"ais-RefinementList-label label"`
        );
        expect(actual.checkbox).toMatchInlineSnapshot(
          `"ais-RefinementList-checkbox checkbox"`
        );
        expect(actual.labelText).toMatchInlineSnapshot(
          `"ais-RefinementList-labelText labelText"`
        );
        expect(actual.count).toMatchInlineSnapshot(
          `"ais-RefinementList-count count"`
        );
        expect(actual.noResults).toMatchInlineSnapshot(
          `"ais-RefinementList-noResults noResults"`
        );
        expect(actual.showMore).toMatchInlineSnapshot(
          `"ais-RefinementList-showMore showMore"`
        );
        expect(actual.disabledShowMore).toMatchInlineSnapshot(
          `"ais-RefinementList-showMore--disabled disabledShowMore"`
        );
        expect(actual.searchable!.root).toMatchInlineSnapshot(
          `"ais-SearchBox searchableRoot"`
        );
        expect(actual.searchable!.form).toMatchInlineSnapshot(
          `"ais-SearchBox-form searchableForm"`
        );
        expect(actual.searchable!.input).toMatchInlineSnapshot(
          `"ais-SearchBox-input searchableInput"`
        );
        expect(actual.searchable!.submit).toMatchInlineSnapshot(
          `"ais-SearchBox-submit searchableSubmit"`
        );
        expect(actual.searchable!.submitIcon).toMatchInlineSnapshot(
          `"ais-SearchBox-submitIcon searchableSubmitIcon"`
        );
        expect(actual.searchable!.reset).toMatchInlineSnapshot(
          `"ais-SearchBox-reset searchableReset"`
        );
        expect(actual.searchable!.resetIcon).toMatchInlineSnapshot(
          `"ais-SearchBox-resetIcon searchableResetIcon"`
        );
        expect(actual.searchable!.loadingIndicator).toMatchInlineSnapshot(
          `"ais-SearchBox-loadingIndicator searchableLoadingIndicator"`
        );
        expect(actual.searchable!.loadingIcon).toMatchInlineSnapshot(
          `"ais-SearchBox-loadingIcon searchableLoadingIcon"`
        );
      });
    });

    it('renders transformed items correctly', async () => {
      const widget = refinementList({
        container,
        attribute: 'attribute',
        transformItems: (items) =>
          items.map((item) => ({ ...item, transformed: true })),
      });

      const search = instantsearch({
        indexName: 'test',
        searchClient,
      });
      search.start();
      search.addWidgets([widget]);
      await wait(0);

      const { props } = render.mock.calls[0][0] as VNode<
        RefinementListProps<RefinementListTemplates>
      >;

      expect(props.facetValues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ transformed: true }),
          expect.objectContaining({ transformed: true }),
        ])
      );
    });
  });

  describe('show more', () => {
    it('should return a configuration with the same top-level limit value (default value)', async () => {
      const widget = refinementList({
        container,
        attribute: 'attribute',
        limit: 1,
      });

      const search = instantsearch({
        indexName: 'test',
        searchClient,
      });
      search.start();
      search.addWidgets([widget]);
      await wait(0);

      expect(search.helper!.state.maxValuesPerFacet).toBe(1);
    });

    it('should return a configuration with the highest limit value (custom value)', async () => {
      const showMoreLimit = 99;
      const widget = refinementList({
        container,
        attribute: 'attribute',
        limit: 1,
        showMore: true,
        showMoreLimit,
      });

      const search = instantsearch({
        indexName: 'test',
        searchClient,
      });
      search.start();
      search.addWidgets([widget]);
      await wait(0);

      expect(search.helper!.state.maxValuesPerFacet).toBe(showMoreLimit);
    });

    it('should not accept a show more limit that is < limit', () => {
      expect(() =>
        refinementList({
          container,
          attribute: 'attribute',
          limit: 100,
          showMore: true,
          showMoreLimit: 1,
        })
      ).toThrow();
    });
  });
});
