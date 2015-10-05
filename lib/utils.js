var utils = {
  getContainerNode,
  renderTemplate,
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

function renderTemplate({template, compileOptions, helpers, data}) {
  var hogan = require('hogan.js');
  var forOwn = require('lodash/object/forOwn');
  var content;

  if (typeof template !== 'string' && typeof template !== 'function') {
    throw new Error('Template must be `string` or `function`');
  }

  if (typeof template === 'function') {
    content = template(data);
  }

  if (typeof template === 'string') {
    data = addTemplateHelpersToData(data);

    content = hogan.compile(template, compileOptions).render(data);
  }

  // We add all our template helper methods to the template as lambdas. Note
  // that lambdas in Mustache are supposed to accept a second argument of
  // `render` to get the rendered value, not the literal `{{value}}`. But
  // this is currently broken (see
  // https://github.com/twitter/hogan.js/issues/222).
  function addTemplateHelpersToData(templateData) {
    templateData.helpers = {};
    forOwn(helpers, (method, name) => {
      templateData.helpers[name] = function() {
        return (text) => {
          var render = (value) => hogan.compile(value, compileOptions).render(this);
          return method.call(this, text, render);
        };
      };
    });
    return data;
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
