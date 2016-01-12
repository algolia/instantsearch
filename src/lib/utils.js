import reduce from 'lodash/collection/reduce';
import forEach from 'lodash/collection/forEach';
import find from 'lodash/collection/find';
import get from 'lodash/object/get';
import isEmpty from 'lodash/lang/isEmpty';
import keys from 'lodash/object/keys';
import uniq from 'lodash/array/uniq';

let utils = {
  getContainerNode,
  bemHelper,
  prepareTemplateProps,
  isSpecialClick,
  isDomElement,
  getRefinements,
  clearRefinementsFromState,
  clearRefinementsAndSearch
};

/**
 * Return the container. If it's a string, it is considered a
 * css selector and retrieves the first matching element. Otherwise
 * test if it validates that it's a correct DOMElement.
 * @param {string|DOMElement} selectorOrHTMLElement a selector or a node
 * @return {DOMElement}
 * @throws Error when the type is not correct
 */
function getContainerNode(selectorOrHTMLElement) {
  let isFromString = (typeof selectorOrHTMLElement === 'string');
  let domElement;
  if (isFromString) {
    domElement = document.querySelector(selectorOrHTMLElement);
  } else {
    domElement = selectorOrHTMLElement;
  }

  if (!isDomElement(domElement)) {
    let errorMessage = 'Container must be `string` or `HTMLElement`.';
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
  return o instanceof HTMLElement || !!o && o.nodeType > 0;
}

function isSpecialClick(event) {
  let isMiddleClick = (event.button === 1);
  return isMiddleClick || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

/**
 * Creates BEM class name according the vanilla BEM style.
 * @param {string} block the main block
 * @return {function} function that takes up to 2 parameters
 * that determine the element and the modifier of the BEM class.
 */
function bemHelper(block) {
  return function(element, modifier) {
    // block
    if (!element && !modifier) {
      return block;
    }
    // block--element
    if (element && !modifier) {
      return `${block}--${element}`;
    }
    // block--element__modifier
    if (element && modifier) {
      return `${block}--${element}__${modifier}`;
    }
    // block__modifier
    if (!element && modifier) {
      return `${block}__${modifier}`;
    }
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
function prepareTemplateProps({
  transformData,
  defaultTemplates,
  templates,
  templatesConfig
}) {
  let preparedTemplates = prepareTemplates(defaultTemplates, templates);

  return {
    transformData,
    templatesConfig,
    ...preparedTemplates
  };
}

function prepareTemplates(defaultTemplates = [], templates = []) {
  const allKeys = uniq([...(keys(defaultTemplates)), ...(keys(templates))]);

  return reduce(allKeys, (config, key) => {
    const defaultTemplate = defaultTemplates[key];
    const customTemplate = templates[key];
    const isCustomTemplate = customTemplate !== undefined && (customTemplate !== defaultTemplate);

    config.templates[key] = isCustomTemplate ? customTemplate : defaultTemplate;
    config.useCustomCompileOptions[key] = isCustomTemplate;

    return config;
  }, {templates: {}, useCustomCompileOptions: {}});
}

function getRefinement(state, type, attributeName, name, resultsFacets) {
  let res = {type, attributeName, name};
  let facet = find(resultsFacets, {name: attributeName});
  let count;
  if (type === 'hierarchical') {
    let facetDeclaration = state.getHierarchicalFacetByName(attributeName);
    let splitted = name.split(facetDeclaration.separator);
    res.name = splitted[splitted.length - 1];
    for (let i = 0; facet !== undefined && i < splitted.length; ++i) {
      facet = find(facet.data, {name: splitted[i]});
    }
    count = get(facet, 'count');
  } else {
    count = get(facet, 'data["' + res.name + '"]');
  }
  const exhaustive = get(facet, 'exhaustive');
  if (count !== undefined) {
    res.count = count;
  }
  if (exhaustive !== undefined) {
    res.exhaustive = exhaustive;
  }
  return res;
}

function getRefinements(results, state) {
  let res = [];

  forEach(state.facetsRefinements, (refinements, attributeName) => {
    forEach(refinements, (name) => {
      res.push(getRefinement(state, 'facet', attributeName, name, results.facets));
    });
  });

  forEach(state.facetsExcludes, (refinements, attributeName) => {
    forEach(refinements, (name) => {
      res.push({type: 'exclude', attributeName, name, exclude: true});
    });
  });

  forEach(state.disjunctiveFacetsRefinements, (refinements, attributeName) => {
    forEach(refinements, (name) => {
      res.push(getRefinement(state, 'disjunctive', attributeName, name, results.disjunctiveFacets));
    });
  });

  forEach(state.hierarchicalFacetsRefinements, (refinements, attributeName) => {
    forEach(refinements, (name) => {
      res.push(getRefinement(state, 'hierarchical', attributeName, name, results.hierarchicalFacets));
    });
  });

  forEach(state.numericRefinements, (operators, attributeName) => {
    forEach(operators, (values, operator) => {
      forEach(values, (name) => {
        name = name + '';
        res.push({type: 'numeric', attributeName, name, operator});
      });
    });
  });

  forEach(state.tagRefinements, (name) => {
    res.push({type: 'tag', attributeName: '_tags', name});
  });

  return res;
}

function clearRefinementsFromState(state, attributeNames) {
  if (isEmpty(attributeNames)) {
    state = state.clearTags();
    state = state.clearRefinements();
    return state;
  }

  forEach(attributeNames, (attributeName) => {
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

export default utils;
