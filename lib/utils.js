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

function renderTemplate({template, templateHelpers, data}) {
  var hogan = require('hogan.js');
  var forEach = require('lodash/collection/forEach');
  var content;

  // We add all our template helper methods to the template as lambdas. Note
  // that lambdas in Mustache are supposed to accept a second argument of
  // `render` to get the rendered value, not the literal `{{value}}`. But
  // this is currently broken (see
  // https://github.com/twitter/hogan.js/issues/222).
  function addTemplateHelpersToData(templateData) {
    templateData.helpers = {};
    forEach(templateHelpers, (method, name) => {
      data.helpers[name] = () => {
        return (value) => {
          return method(hogan.compile(value).render(templateData));
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

    content = hogan.compile(template).render(data);
  }

  return content;
}

module.exports = {
  getContainerNode: getContainerNode,
  renderTemplate: renderTemplate
};
