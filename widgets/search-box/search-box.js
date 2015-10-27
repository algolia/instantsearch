var React = require('react');
var ReactDOM = require('react-dom');
var utils = require('../../lib/utils.js');
var forEach = require('lodash/collection/forEach');
var bem = require('../../lib/utils').bemHelper('ais-search-box');
var cx = require('classnames');

/**
 * Instantiate a searchbox
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} [options.placeholder] Input's placeholder
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string} [options.cssClasses.input] CSS class to add to the input
 * @param  {string} [options.cssClasses.poweredBy] CSS class to add to the poweredBy element
 * @param  {boolean} [poweredBy=false] Show a powered by Algolia link below the input
 * @param  {boolean|string} [autofocus='auto'] autofocus on the input
 * @return {Object}
 */
function searchBox({
  container,
  placeholder = '',
  cssClasses = {},
  poweredBy = false,
  autofocus = 'auto'
}) {
  if (!container) {
    throw new Error('Usage: searchBox({container[, placeholder, cssClasses.{input,poweredBy}, poweredBy, autofocus]})');
  }

  container = utils.getContainerNode(container);

  // Only possible values are 'auto', true and false
  if (typeof autofocus !== 'boolean') {
    autofocus = 'auto';
  }

  return {
    // Hook on an existing input, or add one if none targeted
    getInput: function() {
      if (container.tagName === 'INPUT') {
        return container;
      }
      return container.appendChild(document.createElement('input'));
    },
    init: function(initialState, helper) {
      var defaultAttributes = {
        autocapitalize: 'off',
        autocomplete: 'off',
        autocorrect: 'off',
        placeholder: placeholder,
        role: 'textbox',
        spellcheck: 'false',
        type: 'text',
        value: initialState.query
      };
      var input = this.getInput();

      // Overrides attributes if not already set
      forEach(defaultAttributes, (value, key) => {
        if (input.hasAttribute(key)) {
          return;
        }
        input.setAttribute(key, value);
      });

      // Add classes
      input.classList.add(cx(bem('input'), cssClasses.input));

      input.addEventListener('keyup', () => {
        helper.setQuery(input.value).search();
      });

      // Optional "powered by Algolia" widget
      if (poweredBy) {
        var PoweredBy = require('../../components/PoweredBy/PoweredBy.js');
        var poweredByContainer = document.createElement('div');
        input.parentNode.appendChild(poweredByContainer);
        var poweredByCssClasses = {
          root: cx(bem('powered-by'), cssClasses.poweredBy),
          link: bem('powered-by-link')
        };
        ReactDOM.render(
          <PoweredBy
            cssClasses={poweredByCssClasses}
          />,
          poweredByContainer
        );
      }

      helper.on('change', function(state) {
        if (input !== document.activeElement && input.value !== state.query) {
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

module.exports = searchBox;
