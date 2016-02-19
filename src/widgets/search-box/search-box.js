import React from 'react';
import ReactDOM from 'react-dom';
import utils from '../../lib/utils.js';
import forEach from 'lodash/collection/forEach';
let bem = require('../../lib/utils.js').bemHelper('ais-search-box');
import cx from 'classnames';

const KEY_ENTER = 13;
const KEY_SUPPRESS = 8;

/**
 * Instantiate a searchbox
 * @function searchBox
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} [options.placeholder] Input's placeholder
 * @param  {boolean} [options.poweredBy=false] Show a powered by Algolia link below the input
 * @param  {boolean} [options.wrapInput=true] Wrap the input in a `div.ais-search-box`
 * @param  {boolean|string} [autofocus='auto'] autofocus on the input
 * @param  {boolean} [options.searchOnEnterKeyPressOnly=false] If set, trigger the search
 * once `<Enter>` is pressed only
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the
 * wrapping div (if `wrapInput` set to `true`)
 * @param  {string|string[]} [options.cssClasses.input] CSS class to add to the input
 * @param  {string|string[]} [options.cssClasses.poweredBy] CSS class to add to the poweredBy element
 * @return {Object}
 */
const usage = `Usage:
searchBox({
  container,
  [ placeholder ],
  [ cssClasses.{input,poweredBy} ],
  [ poweredBy ],
  [ wrapInput ],
  [ autofocus ],
  [ searchOnEnterKeyPressOnly ]
})`;
function searchBox({
  container,
  placeholder = '',
  cssClasses = {},
  poweredBy = false,
  wrapInput = true,
  autofocus = 'auto',
  searchOnEnterKeyPressOnly = false
}) {
  // the 'input' event is triggered when the input value changes
  // in any case: typing, copy pasting with mouse..
  // 'onpropertychange' is the IE8 alternative until we support IE8
  // but it's flawed: http://help.dottoro.com/ljhxklln.php
  const INPUT_EVENT = window.addEventListener ?
    'input' :
    'propertychange';

  if (!container) {
    throw new Error(usage);
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
      let CSSClassesToAdd = cx(bem(null), cssClasses.root).split(' ');
      wrapper.classList.add.apply(wrapper.classList, CSSClassesToAdd);
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
      let CSSClassesToAdd = cx(bem('input'), cssClasses.input).split(' ');
      input.classList.add.apply(input.classList, CSSClassesToAdd);
    },
    addPoweredBy: function(input) {
      let PoweredBy = require('../../components/PoweredBy/PoweredBy.js');
      let poweredByContainer = document.createElement('div');
      input.parentNode.insertBefore(poweredByContainer, input.nextSibling);
      let poweredByCssClasses = {
        root: cx(bem('powered-by'), cssClasses.poweredBy),
        link: bem('powered-by-link')
      };
      let link = 'https://www.algolia.com/?' +
        'utm_source=instantsearch.js&' +
        'utm_medium=website&' +
        `utm_content=${location.hostname}&` +
        'utm_campaign=poweredby';

      ReactDOM.render(
        <PoweredBy
          cssClasses={poweredByCssClasses}
          link={link}
        />,
        poweredByContainer
      );
    },
    init: function({state, helper, onHistoryChange}) {
      let isInputTargeted = container.tagName === 'INPUT';
      let input = this.getInput();

      // Add all the needed attributes and listeners to the input
      this.addDefaultAttributesToInput(input, state.query);

      // always set the query on every change
      addListener(input, INPUT_EVENT, setQuery);

      // handle IE8 weirdness where BACKSPACE key will not trigger an input change..
      // can be removed as soon as we remove support for it
      if (INPUT_EVENT === 'propertychange' || window.attachEvent) {
        addListener(input, 'keyup', ifKey(KEY_SUPPRESS, setQuery));
        addListener(input, 'keyup', ifKey(KEY_SUPPRESS, search));
      }

      // only search on enter
      if (searchOnEnterKeyPressOnly) {
        addListener(input, 'keyup', ifKey(KEY_ENTER, search));
      } else {
        addListener(input, INPUT_EVENT, search);
      }

      function setQuery(e) {
        helper.setQuery(getValue(e));
      }

      function search() {
        helper.search();
      }

      function getValue(e) {
        return ((e.currentTarget) ? e.currentTarget : e.srcElement).value;
      }

      function ifKey(expectedKeyCode, fnToExecute) {
        return actualEvent => actualEvent.keyCode === expectedKeyCode && fnToExecute(actualEvent);
      }

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
      onHistoryChange(function(fullState) {
        input.value = fullState.query || '';
      });

      if (autofocus === true || autofocus === 'auto' && helper.state.query === '') {
        input.focus();
      }
    }
  };
}

function addListener(el, type, fn) {
  if (el.addEventListener) {
    el.addEventListener(type, fn);
  } else {
    el.attachEvent('on' + type, fn);
  }
}

export default searchBox;
