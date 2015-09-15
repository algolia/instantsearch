function getContainerNode(selectorOrHTMLElement) {
  if (typeof selectorOrHTMLElement === 'string') {
    return document.querySelector(selectorOrHTMLElement);
  } else if (!isDomElement(selectorOrHTMLElement)) {
    throw new Error('Container must be `string` or `HTMLElement`');
  }

  return selectorOrHTMLElement;
}

function isDomElement(o) {
  return o instanceof HTMLElement || o && o.nodeType > 0;
}

function renderTemplate(template, data) {
  var hogan = require('hogan.js');
  var content;

  if (typeof template === 'string') {
    content = hogan.compile(template).render(data);
  } else if (typeof template === 'function') {
    content = template(data);
  } else {
    throw new Error('Template must be `string` or `function`');
  }

  return content;
}

module.exports = {
  getContainerNode: getContainerNode,
  renderTemplate: renderTemplate
};
