/* eslint react/no-multi-comp: 0 */
import React from 'react';
import CurrentRefinedValues from '../CurrentRefinedValues.js';
import renderer from 'react-test-renderer';

describe('CurrentRefinedValues', () => {
  let defaultTemplates;

  let cssClasses;
  let templateProps;
  let refinements;
  let clearRefinementURLs;

  let parameters;

  beforeEach(() => {
    defaultTemplates = {
      header: 'DEFAULT HEADER TEMPLATE',
      clearAll: 'DEFAULT CLEAR ALL TEMPLATE',
      item: 'DEFAULT ITEM TEMPLATE',
      footer: 'DEFAULT FOOTER TEMPLATE',
    };

    templateProps = {
      templates: {
        clearAll: 'CLEAR ALL',
        item: '{{attributeName}}: {{name}} :{{label}}',
      },
      defaultTemplates,
    };

    cssClasses = {
      clearAll: 'clear-all-class',
      list: 'list-class',
      item: 'item-class',
      link: 'link-class',
      count: 'count-class',
    };

    refinements = [
      {
        type: 'facet',
        attributeName: 'facet',
        name: 'facet-val1',
        count: 1,
        exhaustive: true,
      },
      {
        type: 'facet',
        attributeName: 'facet',
        name: 'facet-val2',
        count: 2,
        exhaustive: true,
      },
      {
        type: 'exclude',
        attributeName: 'facetExclude',
        name: 'disjunctiveFacet-val1',
        exclude: true,
      },
      {
        type: 'disjunctive',
        attributeName: 'disjunctiveFacet',
        name: 'disjunctiveFacet-val1',
      },
      {
        type: 'hierarchical',
        attributeName: 'hierarchicalFacet',
        name: 'hierarchicalFacet-val1',
      },
      {
        type: 'numeric',
        attributeName: 'numericFacet',
        name: 'numericFacet-val1',
        operator: '>=',
      },
      { type: 'tag', attributeName: '_tags', name: 'tag1' },
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
        facet: { name: 'facet' },
        facetExclude: { name: 'facetExclude' },
        disjunctiveFacet: { name: 'disjunctiveFacet' },
        hierarchicalFacet: { name: 'hierarchicalFacet' },
        numericFacet: { name: 'numericFacet' },
        _tags: { name: '_tags' },
      },
      clearAllClick: () => {},
      clearAllPosition: 'before',
      clearAllURL: '#cleared-all',
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
    const tree = renderer
      .create(<CurrentRefinedValues {...parameters} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  describe('options.attributes', () => {
    it('uses label', () => {
      parameters.attributes.facet = { name: 'facet', label: 'COUCOU' };

      const tree = renderer
        .create(<CurrentRefinedValues {...parameters} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('uses template', () => {
      parameters.attributes.facet = {
        name: 'facet',
        template: 'CUSTOM TEMPLATE',
      };

      const tree = renderer
        .create(<CurrentRefinedValues {...parameters} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('uses transformData', () => {
      const transformData = data => ({ label: 'YEAH!', ...data });
      parameters.attributes.facet = { name: 'facet', transformData };

      const tree = renderer
        .create(<CurrentRefinedValues {...parameters} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('options.clearAllPosition', () => {
    it("'before'", () => {
      parameters.clearAllPosition = 'before';
      const tree = renderer
        .create(<CurrentRefinedValues {...parameters} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it("'after'", () => {
      parameters.clearAllPosition = 'after';
      const tree = renderer
        .create(<CurrentRefinedValues {...parameters} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('false', () => {
      parameters.clearAllPosition = false;
      const tree = renderer
        .create(<CurrentRefinedValues {...parameters} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('options.clearAllURL', () => {
    it('is used in the clearAll element before', () => {
      parameters.clearAllURL = '#custom-clear-all';
      const tree = renderer
        .create(<CurrentRefinedValues {...parameters} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('is used in the clearAll element after', () => {
      parameters.clearAllURL = '#custom-clear-all';
      const tree = renderer
        .create(<CurrentRefinedValues {...parameters} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('options.clearRefinementURLs', () => {
    it('is used in an item element', () => {
      parameters.clearRefinementURLs[1] = '#custom-clear-specific';
      const tree = renderer
        .create(<CurrentRefinedValues {...parameters} />)
        .toJSON();
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
        { type: 'facet', attributeName: 'customFacet', name: 'val1' },
      ];
      const tree = renderer
        .create(<CurrentRefinedValues {...parameters} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('can be used with an exclude', () => {
      parameters.refinements = [
        {
          type: 'exclude',
          attributeName: 'customExcludeFacet',
          name: 'val1',
          exclude: true,
        },
      ];
      const tree = renderer
        .create(<CurrentRefinedValues {...parameters} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('can be used with a disjunctive facet', () => {
      parameters.refinements = [
        {
          type: 'disjunctive',
          attributeName: 'customDisjunctiveFacet',
          name: 'val1',
        },
      ];
      const tree = renderer
        .create(<CurrentRefinedValues {...parameters} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('can be used with a hierarchical facet', () => {
      parameters.refinements = [
        {
          type: 'hierarchical',
          attributeName: 'customHierarchicalFacet',
          name: 'val1',
        },
      ];
      const tree = renderer
        .create(<CurrentRefinedValues {...parameters} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('can be used with numeric filters', () => {
      parameters.refinements = [
        {
          type: 'numeric',
          attributeName: 'customNumericFilter',
          operator: '=',
          name: 'val1',
        },
        {
          type: 'numeric',
          attributeName: 'customNumericFilter',
          operator: '<=',
          name: 'val2',
        },
        {
          type: 'numeric',
          attributeName: 'customNumericFilter',
          operator: '>=',
          name: 'val3',
        },
      ];
      const tree = renderer
        .create(<CurrentRefinedValues {...parameters} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });

    it('can be used with a tag', () => {
      parameters.refinements = [
        { type: 'tag', attributeName: '_tags', name: 'tag1' },
      ];
      const tree = renderer
        .create(<CurrentRefinedValues {...parameters} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('options.templateProps', () => {
    it('passes a custom template if given', () => {
      parameters.templateProps.templates.item = 'CUSTOM ITEM TEMPLATE';
      const tree = renderer
        .create(<CurrentRefinedValues {...parameters} />)
        .toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
});
