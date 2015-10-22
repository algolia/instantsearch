var reduce = require('lodash/collection/reduce');

var utils = {
  getContainerNode,
  bemHelper,
  prepareTemplateProps,
  isSpecialClick,
  isDomElement
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
  var isFromString = (typeof selectorOrHTMLElement === 'string');
  var domElement;
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
  return o instanceof HTMLElement || !!o && o.nodeType > 0;
}

function isSpecialClick(event) {
  return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
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
  var preparedTemplates = prepareTemplates(defaultTemplates, templates);

  return {
    transformData,
    templatesConfig,
    ...preparedTemplates
  };
}

function prepareTemplates(defaultTemplates, templates) {
  return reduce(defaultTemplates, (config, defaultTemplate, key) => {
    var isCustomTemplate = templates && templates[key] !== undefined && (templates[key] !== defaultTemplate);
    if (isCustomTemplate) {
      config.templates[key] = templates[key];
      config.useCustomCompileOptions[key] = true;
    } else {
      config.templates[key] = defaultTemplate;
      config.useCustomCompileOptions[key] = false;
    }
    return config;
  }, {templates: {}, useCustomCompileOptions: {}});
}

module.exports = utils;
