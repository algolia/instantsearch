var isString = require('lodash/lang/isString');

function getContainerNode(value) {
  if (isString(value)) {
    return document.querySelector(value);
  }
  return value;
}

function renderTemplate(template, data) {
  var hogan = require('hogan.js');
  var content;

  if (typeof template === 'string') {
    content = hogan.compile(template).render(data);
  } else if (typeof template === 'function') {
    content = template(data);
  }

  return content;
}

module.exports = {
  getContainerNode: getContainerNode,
  renderTemplate: renderTemplate
};
