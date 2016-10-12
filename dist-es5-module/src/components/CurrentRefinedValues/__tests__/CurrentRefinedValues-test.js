'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint-env mocha */
/* eslint react/no-multi-comp: 0 */

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _CurrentRefinedValues = require('../CurrentRefinedValues.js');

var _CurrentRefinedValues2 = _interopRequireDefault(_CurrentRefinedValues);

var _Template = require('../../Template');

var _Template2 = _interopRequireDefault(_Template);

var _expectJsx = require('expect-jsx');

var _expectJsx2 = _interopRequireDefault(_expectJsx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend(_expectJsx2.default);

describe('CurrentRefinedValues', function () {
  var renderer = void 0;

  var defaultTemplates = void 0;

  var cssClasses = void 0;
  var templateProps = void 0;
  var refinements = void 0;
  var refinementKeys = void 0;
  var clearRefinementURLs = void 0;
  var refinementTemplateData = void 0;
  var refinementTemplateProps = void 0;

  var parameters = void 0;

  var listProps = void 0;
  var clearAllLinkProps = void 0;
  var clearAllTemplateProps = void 0;
  var itemProps = void 0;
  var itemLinkProps = void 0;
  var itemTemplateProps = void 0;

  function render() {
    renderer.render(_react2.default.createElement(_CurrentRefinedValues2.default, parameters));
    return renderer.getRenderOutput();
  }

  function buildList() {
    return _react2.default.createElement(
      'div',
      listProps,
      (0, _map2.default)(refinements, function (refinement, i) {
        return _react2.default.createElement(
          'div',
          _extends({ key: refinementKeys[i] }, itemProps),
          _react2.default.createElement(
            'a',
            _extends({ href: clearRefinementURLs[i] }, itemLinkProps),
            _react2.default.createElement(_Template2.default, _extends({
              data: refinementTemplateData[i]
            }, itemTemplateProps, templateProps, refinementTemplateProps[i]))
          )
        );
      })
    );
  }

  function build() {
    var position = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'before';

    if (position === 'before') {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'a',
          clearAllLinkProps,
          _react2.default.createElement(_Template2.default, clearAllTemplateProps)
        ),
        buildList()
      );
    }
    if (position === 'after') {
      return _react2.default.createElement(
        'div',
        null,
        buildList(),
        _react2.default.createElement(
          'a',
          clearAllLinkProps,
          _react2.default.createElement(_Template2.default, clearAllTemplateProps)
        )
      );
    }
    return _react2.default.createElement(
      'div',
      null,
      buildList()
    );
  }

  beforeEach(function () {
    var createRenderer = _reactAddonsTestUtils2.default.createRenderer;

    renderer = createRenderer();

    defaultTemplates = {
      header: 'DEFAULT HEADER TEMPLATE',
      clearAll: 'DEFAULT CLEAR ALL TEMPLATE',
      item: 'DEFAULT ITEM TEMPLATE',
      footer: 'DEFAULT FOOTER TEMPLATE'
    };

    templateProps = {
      templates: {
        clearAll: 'CLEAR ALL',
        item: '{{attributeName}}: {{name}}'
      },
      defaultTemplates: defaultTemplates
    };

    cssClasses = {
      clearAll: 'clear-all-class',
      list: 'list-class',
      item: 'item-class',
      link: 'link-class',
      count: 'count-class'
    };

    refinements = [{ type: 'facet', attributeName: 'facet', name: 'facet-val1', count: 1, exhaustive: true }, { type: 'facet', attributeName: 'facet', name: 'facet-val2', count: 2, exhaustive: true }, { type: 'exclude', attributeName: 'facetExclude', name: 'disjunctiveFacet-val1', exclude: true }, { type: 'disjunctive', attributeName: 'disjunctiveFacet', name: 'disjunctiveFacet-val1' }, { type: 'hierarchical', attributeName: 'hierarchicalFacet', name: 'hierarchicalFacet-val1' }, { type: 'numeric', attributeName: 'numericFacet', name: 'numericFacet-val1', operator: '>=' }, { type: 'tag', attributeName: '_tags', name: 'tag1' }];

    refinementKeys = ['facet:facet-val1', 'facet:facet-val2', 'facetExclude:-facetExclude-val1', 'disjunctiveFacet:disjunctiveFacet-val1', 'hierarchical:hierarchicalFacet-val1', 'numericFacet>=numericFacet-val1', '_tags:tag1'];

    clearRefinementURLs = ['#cleared-facet-val1', '#cleared-facet-val2', '#cleared-facetExclude-val1', '#cleared-disjunctiveFacet-val1', '#cleared-hierarchicalFacet-val1', '#cleared-numericFacet-val1', '#cleared-tag1'];

    refinementTemplateData = [_extends({ cssClasses: cssClasses }, refinements[0]), _extends({ cssClasses: cssClasses }, refinements[1]), _extends({ cssClasses: cssClasses }, refinements[2]), _extends({ cssClasses: cssClasses }, refinements[3]), _extends({ cssClasses: cssClasses }, refinements[4]), _extends({ displayOperator: '&ge;', cssClasses: cssClasses }, refinements[5]), _extends({ cssClasses: cssClasses }, refinements[6])];

    refinementTemplateProps = [{}, {}, {}, {}, {}, {}, {}];

    parameters = {
      attributes: {
        facet: { name: 'facet' },
        facetExclude: { name: 'facetExclude' },
        disjunctiveFacet: { name: 'disjunctiveFacet' },
        hierarchicalFacet: { name: 'hierarchicalFacet' },
        numericFacet: { name: 'numericFacet' },
        _tags: { name: '_tags' }
      },
      clearAllClick: function clearAllClick() {},
      clearAllPosition: 'before',
      clearAllURL: '#cleared-all',
      clearRefinementClicks: [function () {}, function () {}, function () {}, function () {}, function () {}, function () {}, function () {}],
      clearRefinementURLs: clearRefinementURLs,
      cssClasses: cssClasses,
      refinements: refinements,
      templateProps: templateProps
    };

    listProps = {
      className: 'list-class'
    };
    clearAllLinkProps = {
      className: 'clear-all-class',
      href: '#cleared-all',
      onClick: function onClick() {}
    };
    clearAllTemplateProps = _extends({
      templateKey: 'clearAll'
    }, templateProps);
    itemProps = {
      className: 'item-class'
    };
    itemLinkProps = {
      className: 'link-class',
      onClick: function onClick() {}
    };
    itemTemplateProps = _extends({
      templateKey: 'item'
    }, templateProps);
  });

  it('should render twice all elements', function () {
    var out1 = render();
    var out2 = render();

    var expected = build();

    (0, _expect2.default)(out1).toEqualJSX(expected);
    (0, _expect2.default)(out2).toEqualJSX(expected);
  });

  context('options.attributes', function () {
    it('uses label', function () {
      parameters.attributes.facet = { name: 'facet', label: 'label' };

      var out = render();

      (0, _forEach2.default)(refinementTemplateData, function (data) {
        if (data.attributeName === 'facet') {
          data.label = 'label';
        }
      });

      (0, _expect2.default)(out).toEqualJSX(build());
    });

    it('uses template', function () {
      parameters.attributes.facet = { name: 'facet', template: 'CUSTOM TEMPLATE' };

      var out = render();

      (0, _forEach2.default)(refinements, function (refinement, i) {
        if (refinement.attributeName === 'facet') {
          refinementTemplateProps[i].templates = {
            item: 'CUSTOM TEMPLATE'
          };
        }
      });

      (0, _expect2.default)(out).toEqualJSX(build());
    });

    it('uses transformData', function () {
      var transformData = function transformData() {
        return { transform: 'data' };
      };
      parameters.attributes.facet = { name: 'facet', transformData: transformData };
      (0, _forEach2.default)(refinements, function (refinement, i) {
        if (refinement.attributeName === 'facet') {
          refinementTemplateProps[i].transformData = transformData;
        }
      });

      // expectJSX doesn't compare functions
      var usedTransformData = render().props.children[1].props.children[0].props.children.props.children.props.transformData;

      (0, _expect2.default)(usedTransformData).toBe(transformData);
    });

    it('doesn\'t use another attribute', function () {
      parameters.attributes.facet = { name: 'facet', randomAttribute: 'RANDOM VALUE' };
      (0, _expect2.default)(render()).toEqualJSX(build());
    });
  });

  context('options.clearAllClick', function () {
    beforeEach(function () {
      // Not perfect since we depend on an internal
      _CurrentRefinedValues2.default.__Rewire__('handleClick', function (cb) {
        return cb;
      });
    });

    it('is used in the clearAll element before', function () {
      parameters.clearAllPosition = 'before';

      // expectJSX doesn't compare functions
      var usedOnClick = render().props.children[0].props.onClick;

      (0, _expect2.default)(usedOnClick).toBe(parameters.clearAllClick);
    });

    it('is used in the clearAll element after', function () {
      parameters.clearAllPosition = 'after';

      // expectJSX doesn't compare functions
      var usedOnClick = render().props.children[2].props.onClick;

      (0, _expect2.default)(usedOnClick).toBe(parameters.clearAllClick);
    });

    afterEach(function () {
      _CurrentRefinedValues2.default.__ResetDependency__('handleClick');
    });
  });

  context('options.clearAllPosition', function () {
    it('\'before\'', function () {
      parameters.clearAllPosition = 'before';
      (0, _expect2.default)(render()).toEqualJSX(build('before'));
    });

    it('\'after\'', function () {
      parameters.clearAllPosition = 'after';
      (0, _expect2.default)(render()).toEqualJSX(build('after'));
    });

    it('false', function () {
      parameters.clearAllPosition = false;
      (0, _expect2.default)(render()).toEqualJSX(build(false));
    });
  });

  context('options.clearAllURL', function () {
    it('is used in the clearAll element before', function () {
      parameters.clearAllPosition = 'before';
      parameters.clearAllURL = '#custom-clear-all';

      var out = render();

      clearAllLinkProps.href = '#custom-clear-all';

      (0, _expect2.default)(out).toEqualJSX(build('before'));
    });

    it('is used in the clearAll element after', function () {
      parameters.clearAllPosition = 'after';
      parameters.clearAllURL = '#custom-clear-all';

      var out = render();

      clearAllLinkProps.href = '#custom-clear-all';

      (0, _expect2.default)(out).toEqualJSX(build('after'));
    });
  });

  context('options.clearRefinementClicks', function () {
    beforeEach(function () {
      // Not perfect since we depend on an internal
      _CurrentRefinedValues2.default.__Rewire__('handleClick', function (cb) {
        return cb;
      });
    });

    it('is used in an item element', function () {
      // expectJSX doesn't compare functions
      var usedOnClick = render().props.children[1].props.children[1].props.children.props.onClick;

      (0, _expect2.default)(usedOnClick).toBe(parameters.clearRefinementClicks[1]);
    });

    afterEach(function () {
      _CurrentRefinedValues2.default.__ResetDependency__('handleClick');
    });
  });

  context('options.clearRefinementURLs', function () {
    it('is used in an item element', function () {
      parameters.clearRefinementURLs[1] = '#custom-clear-specific';

      var out = render();

      clearRefinementURLs[1] = '#custom-clear-specific';
      (0, _expect2.default)(out).toEqualJSX(build());
    });
  });

  context('options.cssClasses', function () {
    it('uses clearAll', function () {
      parameters.cssClasses.clearAll = 'custom-clear-all-class';

      var out = render();

      clearAllLinkProps.className = 'custom-clear-all-class';

      (0, _expect2.default)(out).toEqualJSX(build());
    });

    it('uses list', function () {
      parameters.cssClasses.list = 'custom-list-class';

      var out = render();

      listProps.className = 'custom-list-class';

      (0, _expect2.default)(out).toEqualJSX(build());
    });

    it('uses item', function () {
      parameters.cssClasses.item = 'custom-item-class';

      var out = render();

      itemProps.className = 'custom-item-class';

      (0, _expect2.default)(out).toEqualJSX(build());
    });

    it('uses link', function () {
      parameters.cssClasses.link = 'custom-link-class';

      var out = render();

      itemLinkProps.className = 'custom-link-class';

      (0, _expect2.default)(out).toEqualJSX(build());
    });

    it('passes them to the item template', function () {
      parameters.cssClasses.count = 'custom-count-class';

      var out = render();

      refinementTemplateData[0].cssClasses.count = 'custom-count-class';
      refinementTemplateData[1].cssClasses.count = 'custom-count-class';

      (0, _expect2.default)(out).toEqualJSX(build());
    });
  });

  context('options.refinements', function () {
    beforeEach(function () {
      parameters.attributes = {};
      parameters.clearRefinementURLs = ['#cleared-custom'];
      parameters.clearRefinementClicks = [function () {}];

      refinementKeys = [];
      clearRefinementURLs = ['#cleared-custom'];
      refinementTemplateData = [_extends({ cssClasses: cssClasses }, refinements[0])];
      refinementTemplateProps = [_extends({}, templateProps)];
    });

    it('can be used with a facet', function () {
      refinements = [{ type: 'facet', attributeName: 'customFacet', name: 'val1' }];

      parameters.refinements = refinements;

      var out = render();

      refinementKeys.push('customFacet:val1');
      refinementTemplateData = [_extends({ cssClasses: cssClasses }, refinements[0])];

      (0, _expect2.default)(out).toEqualJSX(build());
    });

    it('can be used with an exclude', function () {
      refinements = [{ type: 'exclude', attributeName: 'customExcludeFacet', name: 'val1', exclude: true }];

      parameters.refinements = refinements;

      var out = render();

      refinementKeys.push('customExcludeFacet:-val1');
      refinementTemplateData = [_extends({ cssClasses: cssClasses }, refinements[0])];

      (0, _expect2.default)(out).toEqualJSX(build());
    });

    it('can be used with a disjunctive facet', function () {
      refinements = [{ type: 'disjunctive', attributeName: 'customDisjunctiveFacet', name: 'val1' }];

      parameters.refinements = refinements;

      var out = render();

      refinementKeys.push('customDisjunctiveFacet:val1');
      refinementTemplateData = [_extends({ cssClasses: cssClasses }, refinements[0])];

      (0, _expect2.default)(out).toEqualJSX(build());
    });

    it('can be used with a hierarchical facet', function () {
      refinements = [{ type: 'hierarchical', attributeName: 'customHierarchicalFacet', name: 'val1' }];

      parameters.refinements = refinements;

      var out = render();

      refinementKeys.push('customHierarchicalFacet:val1');
      refinementTemplateData = [_extends({ cssClasses: cssClasses }, refinements[0])];

      (0, _expect2.default)(out).toEqualJSX(build());
    });

    it('can be used with numeric filters', function () {
      refinements = [{ type: 'numeric', attributeName: 'customNumericFilter', operator: '=', name: 'val1' }, { type: 'numeric', attributeName: 'customNumericFilter', operator: '<=', name: 'val2' }, { type: 'numeric', attributeName: 'customNumericFilter', operator: '>=', name: 'val3' }];

      parameters.refinements = refinements;

      var out = render();

      refinementKeys.push(['customNumericFilter=val1', 'customNumericFilter<=val2', 'customNumericFilter>=val3']);
      refinementTemplateData = [_extends({ cssClasses: cssClasses, displayOperator: '=' }, refinements[0]), _extends({ cssClasses: cssClasses, displayOperator: '&le;' }, refinements[1]), _extends({ cssClasses: cssClasses, displayOperator: '&ge;' }, refinements[2])];

      (0, _expect2.default)(out).toEqualJSX(build());
    });

    it('can be used with a tag', function () {
      refinements = [{ type: 'tag', attributeName: '_tags', name: 'tag1' }];

      parameters.refinements = refinements;

      var out = render();

      refinementKeys.push('_tags:tag1');
      refinementTemplateData = [_extends({ cssClasses: cssClasses }, refinements[0])];

      (0, _expect2.default)(out).toEqualJSX(build());
    });
  });

  context('options.templateProps', function () {
    it('passes a custom template if given', function () {
      parameters.templateProps.templates.item = 'CUSTOM ITEM TEMPLATE';

      var out = render();

      clearAllTemplateProps.templates.item = 'CUSTOM ITEM TEMPLATE';
      itemTemplateProps.templates.item = 'CUSTOM ITEM TEMPLATE';

      (0, _expect2.default)(out).toEqualJSX(build());
    });
  });
});