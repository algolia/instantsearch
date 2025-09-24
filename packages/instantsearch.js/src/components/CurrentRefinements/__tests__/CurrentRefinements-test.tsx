/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
/** @jsx h */

import { render } from '@testing-library/preact';
import { h } from 'preact';

import CurrentRefinements from '../CurrentRefinements';

describe('CurrentRefinements', () => {
  const cssClasses = {
    root: 'root',
    noRefinementRoot: 'noRefinementRoot',
    list: 'list',
    item: 'item',
    label: 'label',
    category: 'category',
    categoryLabel: 'categoryLabel',
    delete: 'delete',
  };

  it('renders', () => {
    const props = {
      cssClasses,
      canRefine: true,
      items: [
        {
          indexName: 'indexName',
          indexId: 'indexName',
          attribute: 'facet',
          label: 'facet',
          refine: () => {},
          refinements: [
            {
              type: 'facet' as const,
              attribute: 'facet',
              value: 'facet-val1',
              label: 'facet-val1',
            },
            {
              type: 'facet' as const,
              attribute: 'facet',
              value: 'facet-val2',
              label: 'facet-val2',
            },
          ],
        },
        {
          indexName: 'indexName',
          indexId: 'indexName',
          attribute: 'facetExclude',
          label: 'facetExclude',
          refine: () => {},
          refinements: [
            {
              type: 'exclude' as const,
              attribute: 'facetExclude',
              value: 'disjunctiveFacet-val1',
              label: 'disjunctiveFacet-val1',
              exclude: true,
            },
          ],
        },
        {
          indexName: 'indexName',
          indexId: 'indexName',
          attribute: 'disjunctive',
          label: 'disjunctive',
          refine: () => {},
          refinements: [
            {
              type: 'disjunctive' as const,
              attribute: 'disjunctiveFacet',
              value: 'disjunctiveFacet-val1',
              label: 'disjunctiveFacet-val1',
            },
          ],
        },
        {
          indexName: 'indexName',
          indexId: 'indexName',
          attribute: 'hierarchical',
          label: 'hierarchical',
          refine: () => {},
          refinements: [
            {
              type: 'hierarchical' as const,
              attribute: 'hierarchicalFacet',
              value: 'hierarchicalFacet-val1',
              label: 'hierarchicalFacet-val1',
            },
          ],
        },
        {
          indexName: 'indexName',
          indexId: 'indexName',
          attribute: 'numeric',
          label: 'numeric',
          refine: () => {},
          refinements: [
            {
              type: 'numeric' as const,
              attribute: 'numericFacet',
              value: 'numericFacet-val1',
              label: 'numericFacet-val1',
              operator: '>=',
            },
          ],
        },
        {
          indexName: 'indexName',
          indexId: 'indexName',
          attribute: 'tag',
          label: 'tag',
          refine: () => {},
          refinements: [
            {
              type: 'tag' as const,
              attribute: '_tags',
              value: 'tag1',
              label: 'tag1',
            },
          ],
        },
      ],
    };

    const { container } = render(<CurrentRefinements {...props} />);

    expect(container).toMatchSnapshot();
  });

  it('renders without items', () => {
    const props = {
      cssClasses,
      canRefine: false,
      items: [],
    };

    const { container } = render(<CurrentRefinements {...props} />);
    const root = container.querySelector('.root')!;

    expect(root.classList).toContain('noRefinementRoot');
    expect(container).toMatchSnapshot();
  });

  describe('options.refinements', () => {
    it('can be used with a facet', () => {
      const props = {
        cssClasses,
        canRefine: true,
        items: [
          {
            indexName: 'indexName',
            indexId: 'indexName',
            attribute: 'customFacet',
            label: 'customFacet',
            refine: () => {},
            refinements: [
              {
                attribute: 'customFacet',
                type: 'facet' as const,
                value: 'val1',
                label: 'val1',
              },
            ],
          },
        ],
      };

      const { container } = render(<CurrentRefinements {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('can be used with an exclude', () => {
      const props = {
        cssClasses,
        canRefine: true,
        items: [
          {
            indexName: 'indexName',
            indexId: 'indexName',
            attribute: 'customExcludeFacet',
            label: 'customExcludeFacet',
            refine: () => {},
            refinements: [
              {
                attribute: 'customExcludeFacet',
                type: 'exclude' as const,
                value: 'val1',
                label: 'val1',
                exclude: true,
              },
            ],
          },
        ],
      };

      const { container } = render(<CurrentRefinements {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('can be used with a disjunctive facet', () => {
      const props = {
        cssClasses,
        canRefine: true,
        items: [
          {
            indexName: 'indexName',
            indexId: 'indexName',
            attribute: 'customDisjunctiveFacet',
            label: 'customDisjunctiveFacet',
            refine: () => {},
            refinements: [
              {
                attribute: 'customDisjunctiveFacet',
                type: 'disjunctive' as const,
                value: 'val1',
                label: 'val1',
              },
            ],
          },
        ],
      };

      const { container } = render(<CurrentRefinements {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('can be used with a hierarchical facet', () => {
      const props = {
        cssClasses,
        canRefine: true,
        items: [
          {
            indexName: 'indexName',
            indexId: 'indexName',
            attribute: 'customHierarchicalFacet',
            label: 'customHierarchicalFacet',
            refine: () => {},
            refinements: [
              {
                attribute: 'customHierarchicalFacet',
                type: 'hierarchical' as const,
                value: 'val1',
                label: 'val1',
              },
            ],
          },
        ],
      };

      const { container } = render(<CurrentRefinements {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('can be used with numeric filters', () => {
      const props = {
        cssClasses,
        canRefine: true,
        items: [
          {
            indexName: 'indexName',
            indexId: 'indexName',
            attribute: 'customNumericFilter',
            label: 'customNumericFilter',
            refine: () => {},
            refinements: [
              {
                attribute: 'customNumericFilter',
                type: 'numeric' as const,
                operator: '=',
                value: 'val1',
                label: 'val1',
              },
            ],
          },
          {
            indexName: 'indexName',
            indexId: 'indexName',
            attribute: 'customNumericFilter',
            label: 'customNumericFilter',
            refine: () => {},
            refinements: [
              {
                attribute: 'customNumericFilter',
                type: 'numeric' as const,
                operator: '<=',
                value: 'val2',
                label: 'val2',
              },
            ],
          },
          {
            indexName: 'indexName',
            indexId: 'indexName',
            attribute: 'customNumericFilter',
            label: 'customNumericFilter',
            refine: () => {},
            refinements: [
              {
                attribute: 'customNumericFilter',
                type: 'numeric' as const,
                operator: '>=',
                value: 'val3',
                label: 'val3',
              },
            ],
          },
        ],
      };

      const { container } = render(<CurrentRefinements {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('can be used with a tag', () => {
      const props = {
        cssClasses,
        canRefine: true,
        items: [
          {
            indexName: 'indexName',
            indexId: 'indexName',
            attribute: '_tags',
            label: '_tags',
            refine: () => {},
            refinements: [
              {
                attribute: '_tags',
                type: 'tag' as const,
                value: 'tag1',
                label: 'tag1',
              },
            ],
          },
        ],
      };

      const { container } = render(<CurrentRefinements {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('can be used with a query', () => {
      const props = {
        cssClasses,
        canRefine: true,
        items: [
          {
            indexName: 'indexName',
            indexId: 'indexName',
            attribute: 'query',
            label: 'query',
            refine: () => {},
            refinements: [
              {
                attribute: 'query',
                type: 'query' as const,
                value: 'search1',
                label: 'search1',
              },
            ],
          },
        ],
      };

      const { container } = render(<CurrentRefinements {...props} />);
      const categoryLabel =
        container.querySelector('.categoryLabel')!.innerHTML;

      expect(categoryLabel).toEqual('<q>search1</q>');
      expect(container).toMatchSnapshot();
    });
  });
});
