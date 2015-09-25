var utils = require('../lib/utils.js');
var forEach = require('lodash/collection/forEach');

/**
 * Instantiate a searchbox
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String} [options.placeholder='Search here'] Input's placeholder
 * @param  {Object} [options.cssClass] CSS classes to add to the input
 * @param  {boolean} [poweredBy=false] Show a powered by Algolia link below the input
 * @return {Object}
 */
function searchbox(params) {
  // Hook on an existing input, or add one if none targeted
  var input = utils.getContainerNode(params.container);
  if (input.tagName !== 'INPUT') {
    input = input.appendChild(document.createElement('input'));
  }

  return {
    init: function(initialState, helper) {
      var defaultAttributes = {
        autocapitalize: 'off',
        autocomplete: 'off',
        autocorrect: 'off',
        autofocus: 'autofocus',
        className: params.cssClass,
        placeholder: params.placeholder,
        role: 'textbox',
        spellcheck: 'false',
        type: 'text',
        value: initialState.query
      };

      // Overrides attributes if not already set
      forEach(defaultAttributes, (value, key) => {
        if (input.hasAttribute(key)) {
          return;
        }
        input.setAttribute(key, value);
      });

      // Always add our own classes
      input.classList.add('as-search-box__input');

      input.addEventListener('keyup', () => {
        helper.setQuery(input.value).search();
      });

      // Optional "powered by Algolia" widget
      if (params.poweredBy) {
        var React = require('react');
        var PoweredBy = require('../components/PoweredBy');
        var poweredByContainer = document.createElement('div');
        input.parentNode.appendChild(poweredByContainer);
        React.render(<PoweredBy display />, poweredByContainer);
      }
    },
    render: function({helper}) {
      input.value = helper.state.query;
    }
  };
}

module.exports = searchbox;
