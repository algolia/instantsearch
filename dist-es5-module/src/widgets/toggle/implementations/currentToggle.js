'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _find = require('lodash/find');

var _find2 = _interopRequireDefault(_find);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _defaultTemplates = require('../defaultTemplates.js');

var _defaultTemplates2 = _interopRequireDefault(_defaultTemplates);

var _utils = require('../../../lib/utils.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// cannot use a function declaration because of
// https://github.com/speedskater/babel-plugin-rewire/issues/109#issuecomment-227917555
var currentToggle = function currentToggle() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var attributeName = _ref.attributeName;
  var label = _ref.label;
  var userValues = _ref.userValues;
  var templates = _ref.templates;
  var collapsible = _ref.collapsible;
  var transformData = _ref.transformData;
  var hasAnOffValue = _ref.hasAnOffValue;
  var containerNode = _ref.containerNode;
  var RefinementList = _ref.RefinementList;
  var cssClasses = _ref.cssClasses;
  return {
    getConfiguration: function getConfiguration() {
      return {
        disjunctiveFacets: [attributeName]
      };
    },
    toggleRefinement: function toggleRefinement(helper, facetValue, isRefined) {
      var on = userValues.on;
      var off = userValues.off;

      // Checking
      if (!isRefined) {
        if (hasAnOffValue) {
          helper.removeDisjunctiveFacetRefinement(attributeName, off);
        }
        helper.addDisjunctiveFacetRefinement(attributeName, on);
      } else {
        // Unchecking
        helper.removeDisjunctiveFacetRefinement(attributeName, on);
        if (hasAnOffValue) {
          helper.addDisjunctiveFacetRefinement(attributeName, off);
        }
      }

      helper.search();
    },
    init: function init(_ref2) {
      var state = _ref2.state;
      var helper = _ref2.helper;
      var templatesConfig = _ref2.templatesConfig;

      this._templateProps = (0, _utils.prepareTemplateProps)({
        transformData: transformData,
        defaultTemplates: _defaultTemplates2.default,
        templatesConfig: templatesConfig,
        templates: templates
      });

      this.toggleRefinement = this.toggleRefinement.bind(this, helper);

      // no need to refine anything at init if no custom off values
      if (!hasAnOffValue) {
        return;
      }

      // Add filtering on the 'off' value if set
      var isRefined = state.isDisjunctiveFacetRefined(attributeName, userValues.on);
      if (!isRefined) {
        helper.addDisjunctiveFacetRefinement(attributeName, userValues.off);
      }
    },
    render: function render(_ref3) {
      var helper = _ref3.helper;
      var results = _ref3.results;
      var state = _ref3.state;
      var createURL = _ref3.createURL;

      var isRefined = helper.state.isDisjunctiveFacetRefined(attributeName, userValues.on);
      var onValue = userValues.on;
      var offValue = userValues.off === undefined ? false : userValues.off;
      var allFacetValues = results.getFacetValues(attributeName);
      var onData = (0, _find2.default)(allFacetValues, { name: onValue.toString() });
      var onFacetValue = {
        name: label,
        isRefined: onData !== undefined ? onData.isRefined : false,
        count: onData === undefined ? null : onData.count
      };
      var offData = hasAnOffValue ? (0, _find2.default)(allFacetValues, { name: offValue.toString() }) : undefined;
      var offFacetValue = {
        name: label,
        isRefined: offData !== undefined ? offData.isRefined : false,
        count: offData === undefined ? results.nbHits : offData.count
      };

      // what will we show by default,
      // if checkbox is not checked, show: [ ] free shipping (countWhenChecked)
      // if checkbox is checked, show: [x] free shipping (countWhenNotChecked)
      var nextRefinement = isRefined ? offFacetValue : onFacetValue;

      var facetValue = {
        name: label,
        isRefined: isRefined,
        count: nextRefinement === undefined ? null : nextRefinement.count,
        onFacetValue: onFacetValue,
        offFacetValue: offFacetValue
      };

      // Bind createURL to this specific attribute
      function _createURL() {
        return createURL(state.removeDisjunctiveFacetRefinement(attributeName, isRefined ? onValue : userValues.off).addDisjunctiveFacetRefinement(attributeName, isRefined ? userValues.off : onValue));
      }

      _reactDom2.default.render(_react2.default.createElement(RefinementList, {
        collapsible: collapsible,
        createURL: _createURL,
        cssClasses: cssClasses,
        facetValues: [facetValue],
        shouldAutoHideContainer: facetValue.count === 0 || facetValue.count === null,
        templateProps: this._templateProps,
        toggleRefinement: this.toggleRefinement
      }), containerNode);
    }
  };
};

exports.default = currentToggle;