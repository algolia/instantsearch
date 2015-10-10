var utils = {
  getContainerNode,
  bemHelper,
  prepareTemplateProps
};

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

function isDomElement(o) {
  return o instanceof HTMLElement || o && o.nodeType > 0;
}

function bemHelper(block) {
  return function(element, modifier) {
    if (!element) {
      return block;
    }
    if (!modifier) {
      return block + '--' + element;
    }
    return block + '--' + element + '__' + modifier;
  };
}

function prepareTemplateProps({
  transformData,
  defaultTemplates,
  templates: userTemplates,
  templatesConfig
}) {
  var forOwn = require('lodash/object/forOwn');
  var useCustomCompileOptions = {};
  var templates = {};

  forOwn(defaultTemplates, (defaultTemplate, templateKey) => {
    var template = templates[templateKey] =
      userTemplates[templateKey] !== undefined ?
      userTemplates[templateKey] :
      defaultTemplate;

    useCustomCompileOptions[templateKey] = defaultTemplate !== template;
  });

  return {
    transformData,
    templatesConfig,
    templates,
    useCustomCompileOptions
  };
}

module.exports = utils;
