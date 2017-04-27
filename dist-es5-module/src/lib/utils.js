'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prefixKeys = exports.clearRefinementsAndSearch = exports.clearRefinementsFromState = exports.getRefinements = exports.isDomElement = exports.isSpecialClick = exports.prepareTemplateProps = exports.bemHelper = exports.getContainerNode = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _reduce = require('lodash/reduce');

var _reduce2 = _interopRequireDefault(_reduce);

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _find = require('lodash/find');

var _find2 = _interopRequireDefault(_find);

var _get = require('lodash/get');

var _get2 = _interopRequireDefault(_get);

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _keys = require('lodash/keys');

var _keys2 = _interopRequireDefault(_keys);

var _uniq = require('lodash/uniq');

var _uniq2 = _interopRequireDefault(_uniq);

var _mapKeys = require('lodash/mapKeys');

var _mapKeys2 = _interopRequireDefault(_mapKeys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

exports.getContainerNode = getContainerNode;
exports.bemHelper = bemHelper;
exports.prepareTemplateProps = prepareTemplateProps;
exports.isSpecialClick = isSpecialClick;
exports.isDomElement = isDomElement;
exports.getRefinements = getRefinements;
exports.clearRefinementsFromState = clearRefinementsFromState;
exports.clearRefinementsAndSearch = clearRefinementsAndSearch;
exports.prefixKeys = prefixKeys;

/**
 * Return the container. If it's a string, it is considered a
 * css selector and retrieves the first matching element. Otherwise
 * test if it validates that it's a correct DOMElement.
 * @param {string|DOMElement} selectorOrHTMLElement a selector or a node
 * @return {DOMElement} The resolved DOMElement
 * @throws Error when the type is not correct
 */

function getContainerNode(selectorOrHTMLElement) {
  var isFromString = typeof selectorOrHTMLElement === 'string';
  var domElement = void 0;
  if (isFromString) {
    domElement = document.querySelector(selectorOrHTMLElement);
  } else {
    domElement = selectorOrHTMLElement;
  }

  if (!isDomElement(domElement)) {
    var errorMessage = 'Container must be `string` or `HTMLElement`.';
    if (isFromString) {
      errorMessage += ' Unable to find ' + selectorOrHTMLElement;
    }
    throw new Error(errorMessage);
  }

  return domElement;
}

/**
 * Returns true if the parameter is a DOMElement.
 * @param {any} o the value to test
 * @return {boolean} true if o is a DOMElement
 */
function isDomElement(o) {
  return o instanceof window.HTMLElement || Boolean(o) && o.nodeType > 0;
}

function isSpecialClick(event) {
  var isMiddleClick = event.button === 1;
  return isMiddleClick || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

/**
 * Creates BEM class name according the vanilla BEM style.
 * @param {string} block the main block
 * @return {function} function that takes up to 2 parameters
 * that determine the element and the modifier of the BEM class.
 */
function bemHelper(block) {
  return function (element, modifier) {
    // block--element
    if (element && !modifier) {
      return block + '--' + element;
    }
    // block--element__modifier
    if (element && modifier) {
      return block + '--' + element + '__' + modifier;
    }
    // block__modifier
    if (!element && modifier) {
      return block + '__' + modifier;
    }

    return block;
  };
}

/**
 * Prepares an object to be passed to the Template widget
 * @param {object} unknownBecauseES6 an object with the following attributes:
 *  - transformData
 *  - defaultTemplate
 *  - templates
 *  - templatesConfig
 * @return {object} the configuration with the attributes:
 *  - transformData
 *  - defaultTemplate
 *  - templates
 *  - useCustomCompileOptions
 */
function prepareTemplateProps(_ref) {
  var transformData = _ref.transformData;
  var defaultTemplates = _ref.defaultTemplates;
  var templates = _ref.templates;
  var templatesConfig = _ref.templatesConfig;

  var preparedTemplates = prepareTemplates(defaultTemplates, templates);

  return _extends({
    transformData: transformData,
    templatesConfig: templatesConfig
  }, preparedTemplates);
}

function prepareTemplates() {
  var defaultTemplates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var templates = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var allKeys = (0, _uniq2.default)([].concat(_toConsumableArray((0, _keys2.default)(defaultTemplates)), _toConsumableArray((0, _keys2.default)(templates))));

  return (0, _reduce2.default)(allKeys, function (config, key) {
    var defaultTemplate = defaultTemplates[key];
    var customTemplate = templates[key];
    var isCustomTemplate = customTemplate !== undefined && customTemplate !== defaultTemplate;

    config.templates[key] = isCustomTemplate ? customTemplate : defaultTemplate;
    config.useCustomCompileOptions[key] = isCustomTemplate;

    return config;
  }, { templates: {}, useCustomCompileOptions: {} });
}

function getRefinement(state, type, attributeName, name, resultsFacets) {
  var res = { type: type, attributeName: attributeName, name: name };
  var facet = (0, _find2.default)(resultsFacets, { name: attributeName });
  var count = void 0;
  if (type === 'hierarchical') {
    var facetDeclaration = state.getHierarchicalFacetByName(attributeName);
    var splitted = name.split(facetDeclaration.separator);
    res.name = splitted[splitted.length - 1];
    for (var i = 0; facet !== undefined && i < splitted.length; ++i) {
      facet = (0, _find2.default)(facet.data, { name: splitted[i] });
    }
    count = (0, _get2.default)(facet, 'count');
  } else {
    count = (0, _get2.default)(facet, 'data["' + res.name + '"]');
  }
  var exhaustive = (0, _get2.default)(facet, 'exhaustive');
  if (count !== undefined) {
    res.count = count;
  }
  if (exhaustive !== undefined) {
    res.exhaustive = exhaustive;
  }
  return res;
}

function getRefinements(results, state) {
  var res = [];

  (0, _forEach2.default)(state.facetsRefinements, function (refinements, attributeName) {
    (0, _forEach2.default)(refinements, function (name) {
      res.push(getRefinement(state, 'facet', attributeName, name, results.facets));
    });
  });

  (0, _forEach2.default)(state.facetsExcludes, function (refinements, attributeName) {
    (0, _forEach2.default)(refinements, function (name) {
      res.push({ type: 'exclude', attributeName: attributeName, name: name, exclude: true });
    });
  });

  (0, _forEach2.default)(state.disjunctiveFacetsRefinements, function (refinements, attributeName) {
    (0, _forEach2.default)(refinements, function (name) {
      res.push(getRefinement(state, 'disjunctive', attributeName, name, results.disjunctiveFacets));
    });
  });

  (0, _forEach2.default)(state.hierarchicalFacetsRefinements, function (refinements, attributeName) {
    (0, _forEach2.default)(refinements, function (name) {
      res.push(getRefinement(state, 'hierarchical', attributeName, name, results.hierarchicalFacets));
    });
  });

  (0, _forEach2.default)(state.numericRefinements, function (operators, attributeName) {
    (0, _forEach2.default)(operators, function (values, operator) {
      (0, _forEach2.default)(values, function (value) {
        res.push({
          type: 'numeric',
          attributeName: attributeName,
          name: '' + value,
          numericValue: value,
          operator: operator
        });
      });
    });
  });

  (0, _forEach2.default)(state.tagRefinements, function (name) {
    res.push({ type: 'tag', attributeName: '_tags', name: name });
  });

  return res;
}

function clearRefinementsFromState(inputState, attributeNames) {
  var state = inputState;

  if ((0, _isEmpty2.default)(attributeNames)) {
    state = state.clearTags();
    state = state.clearRefinements();
    return state;
  }

  (0, _forEach2.default)(attributeNames, function (attributeName) {
    if (attributeName === '_tags') {
      state = state.clearTags();
    } else {
      state = state.clearRefinements(attributeName);
    }
  });

  return state;
}

function clearRefinementsAndSearch(helper, attributeNames) {
  helper.setState(clearRefinementsFromState(helper.state, attributeNames)).search();
}

function prefixKeys(prefix, obj) {
  if (obj) {
    return (0, _mapKeys2.default)(obj, function (v, k) {
      return prefix + k;
    });
  }

  return undefined;
}