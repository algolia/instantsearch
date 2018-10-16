import React from 'react';
import CurrentRefinements from '../CurrentRefinements.js';
import { mount } from 'enzyme';

describe('CurrentRefinements', () => {
  let defaultTemplates;
  let templateProps;
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
    defaultTemplates = {
      item: 'DEFAULT ITEM TEMPLATE',
    };

    templateProps = {
      templates: {
        clearAll: 'CLEAR ALL',
        item: '{{attribute}}: {{label}}',
      },
      defaultTemplates,
    };

    refinements = [
      {
        attribute: 'facet',
        items: [
          {
            type: 'facet',
            attribute: 'facet',
            value: 'facet-val1',
            label: 'facet-val1',
            refine: () => {},
          },
          {
            type: 'facet',
            attribute: 'facet',
            value: 'facet-val2',
            label: 'facet-val2',
            refine: () => {},
          },
        ],
      },
      {
        attribute: 'facet',
        items: [
          {
            type: 'exclude',
            attribute: 'facetExclude',
            value: 'disjunctiveFacet-val1',
            label: 'disjunctiveFacet-val1',
            exclude: true,
            refine: () => {},
          },
        ],
      },
      {
        attribute: 'disjunctive',
        items: [
          {
            type: 'disjunctive',
            attribute: 'disjunctiveFacet',
            value: 'disjunctiveFacet-val1',
            label: 'disjunctiveFacet-val1',
            refine: () => {},
          },
        ],
      },
      {
        attribute: 'hierarchical',
        items: [
          {
            type: 'hierarchical',
            attribute: 'hierarchicalFacet',
            value: 'hierarchicalFacet-val1',
            label: 'hierarchicalFacet-val1',
            refine: () => {},
          },
        ],
      },
      {
        attribute: 'numeric',
        items: [
          {
            type: 'numeric',
            attribute: 'numericFacet',
            value: 'numericFacet-val1',
            label: 'numericFacet-val1',
            operator: '>=',
            refine: () => {},
          },
        ],
      },
      {
        attribute: 'tag',
        items: [
          {
            type: 'tag',
            attribute: '_tags',
            value: 'tag1',
            label: 'tag1',
            refine: () => {},
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
      templateProps,
    };
  });

  it('renders', () => {
    const tree = mount(<CurrentRefinements {...parameters} />);

    expect(tree).toMatchSnapshot();
  });

  describe('options.attributes', () => {
    it('uses label', () => {
      parameters.attributes.facet = {
        value: 'facet',
        label: 'facet',
      };

      const tree = mount(<CurrentRefinements {...parameters} />);

      expect(tree).toMatchSnapshot();
    });

    it('uses template', () => {
      parameters.attributes.facet = {
        value: 'facet',
        label: 'facet',
        template: 'CUSTOM TEMPLATE',
      };

      const tree = mount(<CurrentRefinements {...parameters} />);

      expect(tree).toMatchSnapshot();
    });
  });

  describe('options.refinements', () => {
    beforeEach(() => {
      parameters.attributes = {};
    });

    it('can be used with a facet', () => {
      parameters.refinements = [
        {
          attribute: 'customFacet',
          items: [
            {
              attribute: 'customFacet',
              type: 'facet',
              value: 'val1',
              label: 'val1',
              refine: () => {},
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
          items: [
            {
              attribute: 'customExcludeFacet',
              type: 'exclude',
              value: 'val1',
              label: 'val1',
              exclude: true,
              refine: () => {},
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
          items: [
            {
              attribute: 'customDisjunctiveFacet',
              type: 'disjunctive',
              value: 'val1',
              label: 'val1',
              refine: () => {},
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
          items: [
            {
              attribute: 'customHierarchicalFacet',
              type: 'hierarchical',
              value: 'val1',
              label: 'val1',
              refine: () => {},
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
          items: [
            {
              attribute: 'customNumericFilter',
              type: 'numeric',
              operator: '=',
              value: 'val1',
              label: 'val1',
              refine: () => {},
            },
          ],
        },
        {
          attribute: 'customNumericFilter',
          items: [
            {
              attribute: 'customNumericFilter',
              type: 'numeric',
              operator: '<=',
              value: 'val2',
              label: 'val2',
              refine: () => {},
            },
          ],
        },
        {
          attribute: 'customNumericFilter',
          items: [
            {
              attribute: 'customNumericFilter',
              type: 'numeric',
              operator: '>=',
              value: 'val3',
              label: 'val3',
              refine: () => {},
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
          items: [
            {
              attribute: '_tags',
              type: 'tag',
              value: 'tag1',
              label: 'tag1',
              refine: () => {},
            },
          ],
        },
      ];
      const tree = mount(<CurrentRefinements {...parameters} />);

      expect(tree).toMatchSnapshot();
    });
  });

  describe('options.templateProps', () => {
    it('passes a custom template if given', () => {
      parameters.templateProps.templates.item = 'CUSTOM ITEM TEMPLATE';
      const tree = mount(<CurrentRefinements {...parameters} />);

      expect(tree).toMatchSnapshot();
    });
  });
});
