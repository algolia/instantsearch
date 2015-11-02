let React = require('react');
let ReactDOM = require('react-dom');
let utils = require('../../lib/utils.js');
let forEach = require('lodash/collection/forEach');
let bem = require('../../lib/utils').bemHelper('ais-search-box');
let cx = require('classnames');

/**
 * Instantiate a searchbox
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} [options.placeholder] Input's placeholder
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string} [options.cssClasses.root] CSS class to add to the wrapping div (if wrapInput set to `true`)
 * @param  {string} [options.cssClasses.input] CSS class to add to the input
 * @param  {string} [options.cssClasses.poweredBy] CSS class to add to the poweredBy element
 * @param  {boolean} [poweredBy=false] Show a powered by Algolia link below the input
 * @param  {boolean} [wrapInput=true] Wrap the input in a div.ais-search-box
 * @param  {boolean|string} [autofocus='auto'] autofocus on the input
 * @return {Object}
 */
function searchBox({
  container,
  placeholder = '',
  cssClasses = {},
  poweredBy = false,
  wrapInput = true,
  autofocus = 'auto'
}) {
  if (!container) {
    throw new Error('Usage: searchBox({container[, placeholder, cssClasses.{input,poweredBy}, poweredBy, wrapInput, autofocus]})');
  }

  container = utils.getContainerNode(container);

  // Only possible values are 'auto', true and false
  if (typeof autofocus !== 'boolean') {
    autofocus = 'auto';
  }

  return {
    getInput: function() {
      // Returns reference to targeted input if present, or create a new one
      if (container.tagName === 'INPUT') {
        return container;
      }
      return document.createElement('input');
    },
    wrapInput: function(input) {
      // Wrap input in a .ais-search-box div
      let wrapper = document.createElement('div');
      wrapper.classList.add(cx(bem(null), cssClasses.root));
      wrapper.appendChild(input);
      return wrapper;
    },
    addDefaultAttributesToInput: function(input, query) {
      let defaultAttributes = {
        autocapitalize: 'off',
        autocomplete: 'off',
        autocorrect: 'off',
        placeholder: placeholder,
        role: 'textbox',
        spellcheck: 'false',
        type: 'text',
        value: query
      };

      // Overrides attributes if not already set
      forEach(defaultAttributes, (value, key) => {
        if (input.hasAttribute(key)) {
          return;
        }
        input.setAttribute(key, value);
      });

      // Add classes
      input.classList.add(cx(bem('input'), cssClasses.input));
    },
    addPoweredBy: function(input) {
      let PoweredBy = require('../../components/PoweredBy/PoweredBy.js');
      let poweredByContainer = document.createElement('div');
      input.parentNode.insertBefore(poweredByContainer, input.nextSibling);
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
    },
    init: function(initialState, helper) {
      let isInputTargeted = container.tagName === 'INPUT';
      let input = this.getInput();

      // Add all the needed attributes and listeners to the input
      this.addDefaultAttributesToInput(input, initialState.query);
      input.addEventListener('keyup', () => {
        helper.setQuery(input.value).search();
      });

      if (isInputTargeted) {
        // To replace the node, we need to create an intermediate node
        let placeholderNode = document.createElement('div');
        input.parentNode.insertBefore(placeholderNode, input);
        let parentNode = input.parentNode;
        let wrappedInput = wrapInput ? this.wrapInput(input) : input;
        parentNode.replaceChild(wrappedInput, placeholderNode);
      } else {
        let wrappedInput = wrapInput ? this.wrapInput(input) : input;
        container.appendChild(wrappedInput);
      }

      // Optional "powered by Algolia" widget
      if (poweredBy) {
        this.addPoweredBy(input);
      }

      // Update value when query change outside of the input
      helper.on('change', function(state) {
        if (input !== document.activeElement && input.value !== state.query) {
          input.value = state.query;
        }
      });

      if (autofocus === true || autofocus === 'auto' && helper.state.query === '') {
        input.focus();
      }
    }
  };
}

module.exports = searchBox;
