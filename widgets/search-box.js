let utils = require('../lib/utils.js');
let forEach = require('lodash/collection/forEach');
let bem = require('../lib/utils').bemHelper('ais-search-box');
let cx = require('classnames');

/**
 * Instantiate a searchbox
 * @param  {String|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {String} [options.placeholder] Input's placeholder
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {String} [options.cssClasses.input] CSS class to add to the input
 * @param  {String} [options.cssClasses.poweredBy] CSS class to add to the poweredBy element
 * @param  {boolean} [options.poweredBy=false] Show a powered by Algolia link below the input
 * @param  {boolean|string} [options.autofocus='auto'] autofocus on the input
 * @return {Object}
 */
function searchBox({
  container,
  placeholder,
  cssClasses = {},
  poweredBy = false,
  autofocus = 'auto'
}) {
  let input = utils.getContainerNode(container);

  if (!input) {
    throw new Error('Usage: searchBox({container[, placeholder, cssClasses.{input,poweredBy}, poweredBy, autofocus]})');
  }

  // Hook on an existing input, or add one if none targeted
  if (input.tagName !== 'INPUT') {
    input = input.appendChild(document.createElement('input'));
  }

  // Only possible values are 'auto', true and false
  if (typeof autofocus !== 'boolean') {
    autofocus = 'auto';
  }

  return {
    init: function(initialState, helper) {
      let defaultAttributes = {
        autocapitalize: 'off',
        autocomplete: 'off',
        autocorrect: 'off',
        placeholder: placeholder,
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

      // Add classes
      input.classList.add(bem('input'), cssClasses.input);

      input.addEventListener('keyup', () => {
        helper.setQuery(input.value).search();
      });

      // Optional "powered by Algolia" widget
      if (poweredBy) {
        let React = require('react');
        let ReactDOM = require('react-dom');
        let PoweredBy = require('../components/PoweredBy/PoweredBy.js');
        let poweredByContainer = document.createElement('div');
        input.parentNode.appendChild(poweredByContainer);
        let poweredByCssClasses = {
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
