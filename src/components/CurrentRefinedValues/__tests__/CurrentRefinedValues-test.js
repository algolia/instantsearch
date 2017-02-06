/* eslint-env mocha */
/* eslint react/no-multi-comp: 0 */

import React from 'react';
import expect from 'expect';
import TestUtils from 'react-addons-test-utils';

import forEach from 'lodash/forEach';
import map from 'lodash/map';

import {RawCurrentRefinedValues as CurrentRefinedValues,
        __RewireAPI__ as CurrentRefinedValuesRewireAPI} from '../CurrentRefinedValues.js'; // eslint-disable-line import/named
import Template from '../../Template';

import expectJSX from 'expect-jsx';
expect.extend(expectJSX);

describe('CurrentRefinedValues', () => {
  let renderer;

  let defaultTemplates;

  let cssClasses;
  let templateProps;
  let refinements;
  let refinementKeys;
  let clearRefinementURLs;
  let refinementTemplateData;
  let refinementTemplateProps;

  let parameters;

  let listProps;
  let clearAllLinkProps;
  let clearAllTemplateProps;
  let itemProps;
  let itemLinkProps;
  let itemTemplateProps;

  function render() {
    renderer.render(<CurrentRefinedValues {...parameters} />);
    return renderer.getRenderOutput();
  }

  function buildList() {
    return (
      <div {...listProps}>
        {map(refinements, (refinement, i) =>
          <div key={refinementKeys[i]} {...itemProps}>
            <a href={clearRefinementURLs[i]} {...itemLinkProps}>
              <Template
                data={refinementTemplateData[i]}
                {...itemTemplateProps}
                {...templateProps}
                {...refinementTemplateProps[i]}
              />
            </a>
          </div>
        )}
      </div>
    );
  }

  function build(position = 'before') {
    if (position === 'before') {
      return (
        <div>
          <a {...clearAllLinkProps}>
            <Template {...clearAllTemplateProps} />
          </a>
          {buildList()}
        </div>
      );
    }
    if (position === 'after') {
      return (
        <div>
          {buildList()}
          <a {...clearAllLinkProps}>
            <Template {...clearAllTemplateProps} />
          </a>
        </div>
      );
    }
    return (
      <div>
        {buildList()}
      </div>
    );
  }

  beforeEach(() => {
    const {createRenderer} = TestUtils;
    renderer = createRenderer();

    defaultTemplates = {
      header: 'DEFAULT HEADER TEMPLATE',
      clearAll: 'DEFAULT CLEAR ALL TEMPLATE',
      item: 'DEFAULT ITEM TEMPLATE',
      footer: 'DEFAULT FOOTER TEMPLATE',
    };

    templateProps = {
      templates: {
        clearAll: 'CLEAR ALL',
        item: '{{attributeName}}: {{name}}',
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
      {type: 'facet', attributeName: 'facet', name: 'facet-val1', count: 1, exhaustive: true},
      {type: 'facet', attributeName: 'facet', name: 'facet-val2', count: 2, exhaustive: true},
      {type: 'exclude', attributeName: 'facetExclude', name: 'disjunctiveFacet-val1', exclude: true},
      {type: 'disjunctive', attributeName: 'disjunctiveFacet', name: 'disjunctiveFacet-val1'},
      {type: 'hierarchical', attributeName: 'hierarchicalFacet', name: 'hierarchicalFacet-val1'},
      {type: 'numeric', attributeName: 'numericFacet', name: 'numericFacet-val1', operator: '>='},
      {type: 'tag', attributeName: '_tags', name: 'tag1'},
    ];

    refinementKeys = [
      'facet:facet-val1',
      'facet:facet-val2',
      'facetExclude:-facetExclude-val1',
      'disjunctiveFacet:disjunctiveFacet-val1',
      'hierarchical:hierarchicalFacet-val1',
      'numericFacet>=numericFacet-val1',
      '_tags:tag1',
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

    refinementTemplateData = [
      {cssClasses, ...refinements[0]},
      {cssClasses, ...refinements[1]},
      {cssClasses, ...refinements[2]},
      {cssClasses, ...refinements[3]},
      {cssClasses, ...refinements[4]},
      {displayOperator: '&ge;', cssClasses, ...refinements[5]},
      {cssClasses, ...refinements[6]},
    ];

    refinementTemplateProps = [{}, {}, {}, {}, {}, {}, {}];

    parameters = {
      attributes: {
        facet: {name: 'facet'},
        facetExclude: {name: 'facetExclude'},
        disjunctiveFacet: {name: 'disjunctiveFacet'},
        hierarchicalFacet: {name: 'hierarchicalFacet'},
        numericFacet: {name: 'numericFacet'},
        _tags: {name: '_tags'},
      },
      clearAllClick: () => {},
      clearAllPosition: 'before',
      clearAllURL: '#cleared-all',
      clearRefinementClicks: [() => {}, () => {}, () => {}, () => {}, () => {}, () => {}, () => {}],
      clearRefinementURLs,
      cssClasses,
      refinements,
      templateProps,
    };

    listProps = {
      className: 'list-class',
    };
    clearAllLinkProps = {
      className: 'clear-all-class',
      href: '#cleared-all',
      onClick: () => {},
    };
    clearAllTemplateProps = {
      templateKey: 'clearAll',
      ...templateProps,
    };
    itemProps = {
      className: 'item-class',
    };
    itemLinkProps = {
      className: 'link-class',
      onClick: () => {},
    };
    itemTemplateProps = {
      templateKey: 'item',
      ...templateProps,
    };
  });

  it('should render twice all elements', () => {
    const out1 = render();
    const out2 = render();

    const expected = build();

    expect(out1).toEqualJSX(expected);
    expect(out2).toEqualJSX(expected);
  });

  context('options.attributes', () => {
    it('uses label', () => {
      parameters.attributes.facet = {name: 'facet', label: 'label'};

      const out = render();

      forEach(refinementTemplateData, data => {
        if (data.attributeName === 'facet') {
          data.label = 'label';
        }
      });

      expect(out).toEqualJSX(build());
    });

    it('uses template', () => {
      parameters.attributes.facet = {name: 'facet', template: 'CUSTOM TEMPLATE'};

      const out = render();

      forEach(refinements, (refinement, i) => {
        if (refinement.attributeName === 'facet') {
          refinementTemplateProps[i].templates = {
            item: 'CUSTOM TEMPLATE',
          };
        }
      });

      expect(out).toEqualJSX(build());
    });

    it('uses transformData', () => {
      const transformData = () => ({transform: 'data'});
      parameters.attributes.facet = {name: 'facet', transformData};
      forEach(refinements, (refinement, i) => {
        if (refinement.attributeName === 'facet') {
          refinementTemplateProps[i].transformData = transformData;
        }
      });

      // expectJSX doesn't compare functions
      const usedTransformData = render()
        .props.children[1]
        .props.children[0]
        .props.children
        .props.children
        .props.transformData;

      expect(usedTransformData).toBe(transformData);
    });

    it('doesn\'t use another attribute', () => {
      parameters.attributes.facet = {name: 'facet', randomAttribute: 'RANDOM VALUE'};
      expect(render()).toEqualJSX(build());
    });
  });

  context('options.clearAllClick', () => {
    beforeEach(() => {
      // Not perfect since we depend on an internal
      CurrentRefinedValuesRewireAPI.__Rewire__('handleClick', cb => cb);
    });

    it('is used in the clearAll element before', () => {
      parameters.clearAllPosition = 'before';

      // expectJSX doesn't compare functions
      const usedOnClick = render()
        .props.children[0]
        .props.onClick;

      expect(usedOnClick).toBe(parameters.clearAllClick);
    });

    it('is used in the clearAll element after', () => {
      parameters.clearAllPosition = 'after';

      // expectJSX doesn't compare functions
      const usedOnClick = render()
        .props.children[2]
        .props.onClick;

      expect(usedOnClick).toBe(parameters.clearAllClick);
    });

    afterEach(() => {
      CurrentRefinedValuesRewireAPI.__ResetDependency__('handleClick');
    });
  });

  context('options.clearAllPosition', () => {
    it('\'before\'', () => {
      parameters.clearAllPosition = 'before';
      expect(render()).toEqualJSX(build('before'));
    });

    it('\'after\'', () => {
      parameters.clearAllPosition = 'after';
      expect(render()).toEqualJSX(build('after'));
    });

    it('false', () => {
      parameters.clearAllPosition = false;
      expect(render()).toEqualJSX(build(false));
    });
  });

  context('options.clearAllURL', () => {
    it('is used in the clearAll element before', () => {
      parameters.clearAllPosition = 'before';
      parameters.clearAllURL = '#custom-clear-all';

      const out = render();

      clearAllLinkProps.href = '#custom-clear-all';

      expect(out).toEqualJSX(build('before'));
    });

    it('is used in the clearAll element after', () => {
      parameters.clearAllPosition = 'after';
      parameters.clearAllURL = '#custom-clear-all';

      const out = render();

      clearAllLinkProps.href = '#custom-clear-all';

      expect(out).toEqualJSX(build('after'));
    });
  });

  context('options.clearRefinementClicks', () => {
    beforeEach(() => {
      // Not perfect since we depend on an internal
      CurrentRefinedValuesRewireAPI.__Rewire__('handleClick', cb => cb);
    });

    it('is used in an item element', () => {
      // expectJSX doesn't compare functions
      const usedOnClick = render()
        .props.children[1]
        .props.children[1]
        .props.children
        .props.onClick;

      expect(usedOnClick).toBe(parameters.clearRefinementClicks[1]);
    });

    afterEach(() => {
      CurrentRefinedValuesRewireAPI.__ResetDependency__('handleClick');
    });
  });

  context('options.clearRefinementURLs', () => {
    it('is used in an item element', () => {
      parameters.clearRefinementURLs[1] = '#custom-clear-specific';

      const out = render();

      clearRefinementURLs[1] = '#custom-clear-specific';
      expect(out).toEqualJSX(build());
    });
  });

  context('options.cssClasses', () => {
    it('uses clearAll', () => {
      parameters.cssClasses.clearAll = 'custom-clear-all-class';

      const out = render();

      clearAllLinkProps.className = 'custom-clear-all-class';

      expect(out).toEqualJSX(build());
    });

    it('uses list', () => {
      parameters.cssClasses.list = 'custom-list-class';

      const out = render();

      listProps.className = 'custom-list-class';

      expect(out).toEqualJSX(build());
    });

    it('uses item', () => {
      parameters.cssClasses.item = 'custom-item-class';

      const out = render();

      itemProps.className = 'custom-item-class';

      expect(out).toEqualJSX(build());
    });

    it('uses link', () => {
      parameters.cssClasses.link = 'custom-link-class';

      const out = render();

      itemLinkProps.className = 'custom-link-class';

      expect(out).toEqualJSX(build());
    });

    it('passes them to the item template', () => {
      parameters.cssClasses.count = 'custom-count-class';

      const out = render();

      refinementTemplateData[0].cssClasses.count = 'custom-count-class';
      refinementTemplateData[1].cssClasses.count = 'custom-count-class';

      expect(out).toEqualJSX(build());
    });
  });

  context('options.refinements', () => {
    beforeEach(() => {
      parameters.attributes = {};
      parameters.clearRefinementURLs = ['#cleared-custom'];
      parameters.clearRefinementClicks = [() => {}];

      refinementKeys = [];
      clearRefinementURLs = ['#cleared-custom'];
      refinementTemplateData = [{cssClasses, ...refinements[0]}];
      refinementTemplateProps = [{...templateProps}];
    });

    it('can be used with a facet', () => {
      refinements = [{type: 'facet', attributeName: 'customFacet', name: 'val1'}];

      parameters.refinements = refinements;

      const out = render();

      refinementKeys.push('customFacet:val1');
      refinementTemplateData = [{cssClasses, ...refinements[0]}];

      expect(out).toEqualJSX(build());
    });

    it('can be used with an exclude', () => {
      refinements = [{type: 'exclude', attributeName: 'customExcludeFacet', name: 'val1', exclude: true}];

      parameters.refinements = refinements;

      const out = render();

      refinementKeys.push('customExcludeFacet:-val1');
      refinementTemplateData = [{cssClasses, ...refinements[0]}];

      expect(out).toEqualJSX(build());
    });

    it('can be used with a disjunctive facet', () => {
      refinements = [{type: 'disjunctive', attributeName: 'customDisjunctiveFacet', name: 'val1'}];

      parameters.refinements = refinements;

      const out = render();

      refinementKeys.push('customDisjunctiveFacet:val1');
      refinementTemplateData = [{cssClasses, ...refinements[0]}];

      expect(out).toEqualJSX(build());
    });

    it('can be used with a hierarchical facet', () => {
      refinements = [{type: 'hierarchical', attributeName: 'customHierarchicalFacet', name: 'val1'}];

      parameters.refinements = refinements;

      const out = render();

      refinementKeys.push('customHierarchicalFacet:val1');
      refinementTemplateData = [{cssClasses, ...refinements[0]}];

      expect(out).toEqualJSX(build());
    });

    it('can be used with numeric filters', () => {
      refinements = [
        {type: 'numeric', attributeName: 'customNumericFilter', operator: '=', name: 'val1'},
        {type: 'numeric', attributeName: 'customNumericFilter', operator: '<=', name: 'val2'},
        {type: 'numeric', attributeName: 'customNumericFilter', operator: '>=', name: 'val3'},
      ];

      parameters.refinements = refinements;

      const out = render();

      refinementKeys.push([
        'customNumericFilter=val1',
        'customNumericFilter<=val2',
        'customNumericFilter>=val3',
      ]);
      refinementTemplateData = [
        {cssClasses, displayOperator: '=', ...refinements[0]},
        {cssClasses, displayOperator: '&le;', ...refinements[1]},
        {cssClasses, displayOperator: '&ge;', ...refinements[2]},
      ];

      expect(out).toEqualJSX(build());
    });

    it('can be used with a tag', () => {
      refinements = [{type: 'tag', attributeName: '_tags', name: 'tag1'}];

      parameters.refinements = refinements;

      const out = render();

      refinementKeys.push('_tags:tag1');
      refinementTemplateData = [{cssClasses, ...refinements[0]}];

      expect(out).toEqualJSX(build());
    });
  });

  context('options.templateProps', () => {
    it('passes a custom template if given', () => {
      parameters.templateProps.templates.item = 'CUSTOM ITEM TEMPLATE';

      const out = render();

      clearAllTemplateProps.templates.item = 'CUSTOM ITEM TEMPLATE';
      itemTemplateProps.templates.item = 'CUSTOM ITEM TEMPLATE';

      expect(out).toEqualJSX(build());
    });
  });
});
