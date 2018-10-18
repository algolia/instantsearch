import React from 'react';
import CurrentRefinements from '../CurrentRefinements.js';
import { mount } from 'enzyme';

describe('CurrentRefinements', () => {
  let refinements;
  let parameters;

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

  beforeEach(() => {
    refinements = [
      {
        attribute: 'facet',
        refine: () => {},
        items: [
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
        attribute: 'facet',
        refine: () => {},
        items: [
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
        refine: () => {},
        items: [
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
        refine: () => {},
        items: [
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
        refine: () => {},
        items: [
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
        refine: () => {},
        items: [
          {
            type: 'tag',
            attribute: '_tags',
            value: 'tag1',
            label: 'tag1',
          },
        ],
      },
    ];

    parameters = {
      attributes: {
        facet: {
          value: 'facet',
          label: 'facet',
        },
        facetExclude: {
          value: 'facetExclude',
          label: 'facetExclude',
        },
        disjunctiveFacet: {
          value: 'disjunctiveFacet',
          label: 'disjunctiveFacet',
        },
        hierarchicalFacet: {
          value: 'hierarchicalFacet',
          label: 'hierarchicalFacet',
        },
        numericFacet: {
          value: 'numericFacet',
          label: 'numericFacet',
        },
        _tags: {
          value: '_tags',
          label: '_tags',
        },
      },
      cssClasses,
      refinements,
    };
  });

  it('renders', () => {
    const tree = mount(<CurrentRefinements {...parameters} />);

    expect(tree).toMatchSnapshot();
  });

  describe('options.refinements', () => {
    beforeEach(() => {
      parameters.attributes = {};
    });

    it('can be used with a facet', () => {
      parameters.refinements = [
        {
          attribute: 'customFacet',
          refine: () => {},
          items: [
            {
              attribute: 'customFacet',
              type: 'facet',
              value: 'val1',
              label: 'val1',
            },
          ],
        },
      ];
      const tree = mount(<CurrentRefinements {...parameters} />);

      expect(tree).toMatchSnapshot();
    });

    it('can be used with an exclude', () => {
      parameters.refinements = [
        {
          attribute: 'customExcludeFacet',
          refine: () => {},
          items: [
            {
              attribute: 'customExcludeFacet',
              type: 'exclude',
              value: 'val1',
              label: 'val1',
              exclude: true,
            },
          ],
        },
      ];
      const tree = mount(<CurrentRefinements {...parameters} />);

      expect(tree).toMatchSnapshot();
    });

    it('can be used with a disjunctive facet', () => {
      parameters.refinements = [
        {
          attribute: 'customDisjunctiveFacet',
          refine: () => {},
          items: [
            {
              attribute: 'customDisjunctiveFacet',
              type: 'disjunctive',
              value: 'val1',
              label: 'val1',
            },
          ],
        },
      ];
      const tree = mount(<CurrentRefinements {...parameters} />);

      expect(tree).toMatchSnapshot();
    });

    it('can be used with a hierarchical facet', () => {
      parameters.refinements = [
        {
          attribute: 'customHierarchicalFacet',
          refine: () => {},
          items: [
            {
              attribute: 'customHierarchicalFacet',
              type: 'hierarchical',
              value: 'val1',
              label: 'val1',
            },
          ],
        },
      ];
      const tree = mount(<CurrentRefinements {...parameters} />);

      expect(tree).toMatchSnapshot();
    });

    it('can be used with numeric filters', () => {
      parameters.refinements = [
        {
          attribute: 'customNumericFilter',
          refine: () => {},
          items: [
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
          refine: () => {},
          items: [
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
          refine: () => {},
          items: [
            {
              attribute: 'customNumericFilter',
              type: 'numeric',
              operator: '>=',
              value: 'val3',
              label: 'val3',
            },
          ],
        },
      ];
      const tree = mount(<CurrentRefinements {...parameters} />);

      expect(tree).toMatchSnapshot();
    });

    it('can be used with a tag', () => {
      parameters.refinements = [
        {
          attribute: '_tags',
          refine: () => {},
          items: [
            {
              attribute: '_tags',
              type: 'tag',
              value: 'tag1',
              label: 'tag1',
            },
          ],
        },
      ];
      const tree = mount(<CurrentRefinements {...parameters} />);

      expect(tree).toMatchSnapshot();
    });
  });
});
