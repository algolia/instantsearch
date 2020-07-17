/** @jsx h */

import { h } from 'preact';
import { render } from '@testing-library/preact';
import CurrentRefinements from '../CurrentRefinements';

describe('CurrentRefinements', () => {
  const cssClasses = {
    root: 'root',
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
      items: [
        {
          indexName: 'indexName',
          attribute: 'facet',
          label: 'facet',
          refine: () => {},
          refinements: [
            {
              type: 'facet',
              attribute: 'facet',
              value: 'facet-val1',
              label: 'facet-val1',
            },
            {
              type: 'facet',
              attribute: 'facet',
              value: 'facet-val2',
              label: 'facet-val2',
            },
          ],
        },
        {
          indexName: 'indexName',
          attribute: 'facetExclude',
          label: 'facetExclude',
          refine: () => {},
          refinements: [
            {
              type: 'exclude',
              attribute: 'facetExclude',
              value: 'disjunctiveFacet-val1',
              label: 'disjunctiveFacet-val1',
              exclude: true,
            },
          ],
        },
        {
          indexName: 'indexName',
          attribute: 'disjunctive',
          label: 'disjunctive',
          refine: () => {},
          refinements: [
            {
              type: 'disjunctive',
              attribute: 'disjunctiveFacet',
              value: 'disjunctiveFacet-val1',
              label: 'disjunctiveFacet-val1',
            },
          ],
        },
        {
          indexName: 'indexName',
          attribute: 'hierarchical',
          label: 'hierarchical',
          refine: () => {},
          refinements: [
            {
              type: 'hierarchical',
              attribute: 'hierarchicalFacet',
              value: 'hierarchicalFacet-val1',
              label: 'hierarchicalFacet-val1',
            },
          ],
        },
        {
          indexName: 'indexName',
          attribute: 'numeric',
          label: 'numeric',
          refine: () => {},
          refinements: [
            {
              type: 'numeric',
              attribute: 'numericFacet',
              value: 'numericFacet-val1',
              label: 'numericFacet-val1',
              operator: '>=',
            },
          ],
        },
        {
          indexName: 'indexName',
          attribute: 'tag',
          label: 'tag',
          refine: () => {},
          refinements: [
            {
              type: 'tag',
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

  describe('options.refinements', () => {
    it('can be used with a facet', () => {
      const props = {
        cssClasses,
        items: [
          {
            indexName: 'indexName',
            attribute: 'customFacet',
            label: 'customFacet',
            refine: () => {},
            refinements: [
              {
                attribute: 'customFacet',
                type: 'facet',
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
        items: [
          {
            indexName: 'indexName',
            attribute: 'customExcludeFacet',
            label: 'customExcludeFacet',
            refine: () => {},
            refinements: [
              {
                attribute: 'customExcludeFacet',
                type: 'exclude',
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
        items: [
          {
            indexName: 'indexName',
            attribute: 'customDisjunctiveFacet',
            label: 'customDisjunctiveFacet',
            refine: () => {},
            refinements: [
              {
                attribute: 'customDisjunctiveFacet',
                type: 'disjunctive',
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
        items: [
          {
            indexName: 'indexName',
            attribute: 'customHierarchicalFacet',
            label: 'customHierarchicalFacet',
            refine: () => {},
            refinements: [
              {
                attribute: 'customHierarchicalFacet',
                type: 'hierarchical',
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
        items: [
          {
            indexName: 'indexName',
            attribute: 'customNumericFilter',
            label: 'customNumericFilter',
            refine: () => {},
            refinements: [
              {
                attribute: 'customNumericFilter',
                type: 'numeric',
                operator: '=',
                value: 'val1',
                label: 'val1',
              },
            ],
          },
          {
            indexName: 'indexName',
            attribute: 'customNumericFilter',
            label: 'customNumericFilter',
            refine: () => {},
            refinements: [
              {
                attribute: 'customNumericFilter',
                type: 'numeric',
                operator: '<=',
                value: 'val2',
                label: 'val2',
              },
            ],
          },
          {
            indexName: 'indexName',
            attribute: 'customNumericFilter',
            label: 'customNumericFilter',
            refine: () => {},
            refinements: [
              {
                attribute: 'customNumericFilter',
                type: 'numeric',
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
        items: [
          {
            indexName: 'indexName',
            attribute: '_tags',
            label: '_tags',
            refine: () => {},
            refinements: [
              {
                attribute: '_tags',
                type: 'tag',
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
        items: [
          {
            indexName: 'indexName',
            attribute: 'query',
            label: 'query',
            refine: () => {},
            refinements: [
              {
                attribute: 'query',
                type: 'query',
                value: 'search1',
                label: 'search1',
              },
            ],
          },
        ],
      };

      const { container } = render(<CurrentRefinements {...props} />);
      const categoryLabel = container.querySelector('.categoryLabel')!
        .innerHTML;

      expect(categoryLabel).toEqual('<q>search1</q>');
      expect(container).toMatchSnapshot();
    });
  });
});
