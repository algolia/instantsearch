import React from 'react';
import CurrentRefinements from '../CurrentRefinements';
import { mount } from 'enzyme';

describe('CurrentRefinements', () => {
  const cssClasses = {
    root: 'root',
    list: 'list',
    item: 'item',
    label: 'label',
    category: 'category',
    categoryLabel: 'categoryLabel',
    delete: 'delete',
    reset: 'reset',
  };

  it('renders', () => {
    const props = {
      cssClasses,
      items: [
        {
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

    const tree = mount(<CurrentRefinements {...props} />);

    expect(tree).toMatchSnapshot();
  });

  describe('options.refinements', () => {
    it('can be used with a facet', () => {
      const props = {
        cssClasses,
        items: [
          {
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

      const tree = mount(<CurrentRefinements {...props} />);

      expect(tree).toMatchSnapshot();
    });

    it('can be used with an exclude', () => {
      const props = {
        cssClasses,
        items: [
          {
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

      const tree = mount(<CurrentRefinements {...props} />);

      expect(tree).toMatchSnapshot();
    });

    it('can be used with a disjunctive facet', () => {
      const props = {
        cssClasses,
        items: [
          {
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

      const tree = mount(<CurrentRefinements {...props} />);

      expect(tree).toMatchSnapshot();
    });

    it('can be used with a hierarchical facet', () => {
      const props = {
        cssClasses,
        items: [
          {
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

      const tree = mount(<CurrentRefinements {...props} />);

      expect(tree).toMatchSnapshot();
    });

    it('can be used with numeric filters', () => {
      const props = {
        cssClasses,
        items: [
          {
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

      const tree = mount(<CurrentRefinements {...props} />);

      expect(tree).toMatchSnapshot();
    });

    it('can be used with a tag', () => {
      const props = {
        cssClasses,
        items: [
          {
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

      const tree = mount(<CurrentRefinements {...props} />);

      expect(tree).toMatchSnapshot();
    });

    it('can be used with a query', () => {
      const props = {
        cssClasses,
        items: [
          {
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

      const tree = mount(<CurrentRefinements {...props} />);

      expect(tree.find('.categoryLabel').contains(<q>search1</q>)).toBe(true);
      expect(tree).toMatchSnapshot();
    });
  });
});
