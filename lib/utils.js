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

function renderTemplate({template, defaultTemplate, config, data}) {
  var hogan = require('hogan.js');
  var forEach = require('lodash/collection/forEach');
  var options = config.options;
  var content;

  if (template === null || typeof template === 'undefined') {
    if (defaultTemplate === null || typeof defaultTemplate === 'undefined') {
      throw new Error('No template provided and no defaultTemplate');
    }
    // If template isn't set, we reset the options since our defaultTemplates
    // don't expect options to be set
    options = {};
    template = defaultTemplate;
  }

  if (template === '') {
    return null;
  }

  // We add all our template helper methods to the template as lambdas. Note
  // that lambdas in Mustache are supposed to accept a second argument of
  // `render` to get the rendered value, not the literal `{{value}}`. But
  // this is currently broken (see
  // https://github.com/twitter/hogan.js/issues/222).
  function addTemplateHelpersToData(templateData) {
    templateData.helpers = {};
    forEach(config.helpers, (method, name) => {
      data.helpers[name] = () => {
        return (value) => {
          return method(hogan.compile(value, options).render(templateData));
        };
      };
    });
    return data;
  }

  if (typeof template !== 'string' && typeof template !== 'function') {
    throw new Error('Template must be `string` or `function`');
  }

  if (typeof template === 'function') {
    content = template(data);
  }

  if (typeof template === 'string') {
    data = addTemplateHelpersToData(data);

    content = hogan.compile(template, options).render(data);
  }

  return content;
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

module.exports = {
  getContainerNode,
  renderTemplate,
  bemHelper
};
