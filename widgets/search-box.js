var utils = require('../lib/utils.js');
var forEach = require('lodash/collection/forEach');

/**
 * Instantiate a searchbox
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String} [options.placeholder='Search here'] Input's placeholder
 * @param  {Object} [options.cssClass] CSS classes to add to the input
 * @param  {boolean} [poweredBy=false] Show a powered by Algolia link below the input
 * @param  {boolean|string} [autofocus='auto'] autofocus on the input
 * @return {Object}
 */
function searchbox(params) {
  // Hook on an existing input, or add one if none targeted
  var input = utils.getContainerNode(params.container);
  if (input.tagName !== 'INPUT') {
    input = input.appendChild(document.createElement('input'));
  }

  var autofocus = (typeof params.autofocus === 'boolean' || params.autofocus === 'auto') ?
    params.autofocus :
    'auto';

  return {
    init: function(initialState, helper) {
      var defaultAttributes = {
        autocapitalize: 'off',
        autocomplete: 'off',
        autocorrect: 'off',
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

      helper.on('change', function(state) {
        if (input.value !== state.query) {
          input.value = state.query;
        }
      });

      if (autofocus === true ||
          autofocus === 'auto' && helper.state.query === '') {
        input.focus();
      }
    }
  };
}

module.exports = searchbox;
