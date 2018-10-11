import React from 'react';
import CurrentRefinedValues from '../CurrentRefinedValues.js';
import { mount } from 'enzyme';

describe('CurrentRefinedValues', () => {
  let defaultTemplates;
  let templateProps;
  let refinements;
  let clearRefinementURLs;
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
        item: '{{attributeName}}: {{name}} :{{label}}',
      },
      defaultTemplates,
    };

    refinements = [
      {
        type: 'facet',
        attributeName: 'facet',
        name: 'facet-val1',
        computedLabel: 'facet-val1',
        count: 1,
        exhaustive: true,
      },
      {
        type: 'facet',
        attributeName: 'facet',
        name: 'facet-val2',
        computedLabel: 'facet-val2',
        count: 2,
        exhaustive: true,
      },
      {
        type: 'exclude',
        attributeName: 'facetExclude',
        name: 'disjunctiveFacet-val1',
        computedLabel: 'disjunctiveFacet-val1',
        exclude: true,
      },
      {
        type: 'disjunctive',
        attributeName: 'disjunctiveFacet',
        name: 'disjunctiveFacet-val1',
        computedLabel: 'disjunctiveFacet-val1',
      },
      {
        type: 'hierarchical',
        attributeName: 'hierarchicalFacet',
        name: 'hierarchicalFacet-val1',
        computedLabel: 'hierarchicalFacet-val1',
      },
      {
        type: 'numeric',
        attributeName: 'numericFacet',
        name: 'numericFacet-val1',
        computedLabel: 'numericFacet-val1',
        operator: '>=',
      },
      {
        type: 'tag',
        attributeName: '_tags',
        name: 'tag1',
        computedLabel: 'tag1',
      },
    ];

    clearRefinementURLs = [
      '#cleared-facet-val1',
      '#cleared-facet-val2',
      '#cleared-facetExclude-val1',
      '#cleared-disjunctiveFacet-val1',
      '#cleared-hierarchicalFacet-val1',
      '#cleared-numericFacet-val1',
      '#cleared-tag1',
    ];

    parameters = {
      attributes: {
        facet: {
          name: 'facet',
          computedLabel: 'facet',
        },
        facetExclude: {
          name: 'facetExclude',
          computedLabel: 'facetExclude',
        },
        disjunctiveFacet: {
          name: 'disjunctiveFacet',
          computedLabel: 'disjunctiveFacet',
        },
        hierarchicalFacet: {
          name: 'hierarchicalFacet',
          computedLabel: 'hierarchicalFacet',
        },
        numericFacet: {
          name: 'numericFacet',
          computedLabel: 'numericFacet',
        },
        _tags: {
          name: '_tags',
          computedLabel: '_tags',
        },
      },
      clearRefinementClicks: [
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
      ],
      clearRefinementURLs,
      cssClasses,
      refinements,
      templateProps,
    };
  });

  it('renders', () => {
    const tree = mount(<CurrentRefinedValues {...parameters} />);

    expect(tree).toMatchSnapshot();
  });

  describe('options.attributes', () => {
    it('uses label', () => {
      parameters.attributes.facet = {
        name: 'facet',
        computedLabel: 'facet',
        label: 'COUCOU',
      };

      const tree = mount(<CurrentRefinedValues {...parameters} />);

      expect(tree).toMatchSnapshot();
    });

    it('uses template', () => {
      parameters.attributes.facet = {
        name: 'facet',
        computedLabel: 'facet',
        template: 'CUSTOM TEMPLATE',
      };

      const tree = mount(<CurrentRefinedValues {...parameters} />);

      expect(tree).toMatchSnapshot();
    });
  });

  describe('options.clearRefinementURLs', () => {
    it('is used in an item element', () => {
      parameters.clearRefinementURLs[1] = '#custom-clear-specific';
      const tree = mount(<CurrentRefinedValues {...parameters} />);

      expect(tree).toMatchSnapshot();
    });
  });

  describe('options.refinements', () => {
    beforeEach(() => {
      parameters.attributes = {};
      parameters.clearRefinementURLs = ['#cleared-custom'];
      parameters.clearRefinementClicks = [() => {}];
      clearRefinementURLs = ['#cleared-custom'];
    });

    it('can be used with a facet', () => {
      parameters.refinements = [
        {
          type: 'facet',
          attributeName: 'customFacet',
          name: 'val1',
          computedLabel: 'val1',
        },
      ];
      const tree = mount(<CurrentRefinedValues {...parameters} />);

      expect(tree).toMatchSnapshot();
    });

    it('can be used with an exclude', () => {
      parameters.refinements = [
        {
          type: 'exclude',
          attributeName: 'customExcludeFacet',
          name: 'val1',
          computedLabel: 'val1',
          exclude: true,
        },
      ];
      const tree = mount(<CurrentRefinedValues {...parameters} />);

      expect(tree).toMatchSnapshot();
    });

    it('can be used with a disjunctive facet', () => {
      parameters.refinements = [
        {
          type: 'disjunctive',
          attributeName: 'customDisjunctiveFacet',
          name: 'val1',
          computedLabel: 'val1',
        },
      ];
      const tree = mount(<CurrentRefinedValues {...parameters} />);

      expect(tree).toMatchSnapshot();
    });

    it('can be used with a hierarchical facet', () => {
      parameters.refinements = [
        {
          type: 'hierarchical',
          attributeName: 'customHierarchicalFacet',
          name: 'val1',
          computedLabel: 'val1',
        },
      ];
      const tree = mount(<CurrentRefinedValues {...parameters} />);

      expect(tree).toMatchSnapshot();
    });

    it('can be used with numeric filters', () => {
      parameters.refinements = [
        {
          type: 'numeric',
          attributeName: 'customNumericFilter',
          operator: '=',
          name: 'val1',
          computedLabel: 'val1',
        },
        {
          type: 'numeric',
          attributeName: 'customNumericFilter',
          operator: '<=',
          name: 'val2',
          computedLabel: 'val2',
        },
        {
          type: 'numeric',
          attributeName: 'customNumericFilter',
          operator: '>=',
          name: 'val3',
          computedLabel: 'val3',
        },
      ];
      const tree = mount(<CurrentRefinedValues {...parameters} />);

      expect(tree).toMatchSnapshot();
    });

    it('can be used with a tag', () => {
      parameters.refinements = [
        {
          type: 'tag',
          attributeName: '_tags',
          name: 'tag1',
          computedLabel: 'tag1',
        },
      ];
      const tree = mount(<CurrentRefinedValues {...parameters} />);

      expect(tree).toMatchSnapshot();
    });
  });

  describe('options.templateProps', () => {
    it('passes a custom template if given', () => {
      parameters.templateProps.templates.item = 'CUSTOM ITEM TEMPLATE';
      const tree = mount(<CurrentRefinedValues {...parameters} />);

      expect(tree).toMatchSnapshot();
    });
  });
});
