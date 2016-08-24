import {
  bemHelper,
  getContainerNode
} from '../../lib/utils.js';
import forEach from 'lodash/collection/forEach';
import isString from 'lodash/lang/isString';
import isFunction from 'lodash/lang/isFunction';
import cx from 'classnames';
import Hogan from 'hogan.js';
import defaultTemplates from './defaultTemplates.js';

const bem = bemHelper('ais-search-box');
const KEY_ENTER = 13;
const KEY_SUPPRESS = 8;

/**
 * Instantiate a searchbox
 * @function searchBox
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} [options.placeholder] Input's placeholder
 * @param  {boolean|Object} [options.poweredBy=false] Define if a "powered by Algolia" link should be added near the input
 * @param  {function|string} [options.poweredBy.template] Template used for displaying the link. Can accept a function or a Hogan string.
 * @param  {number} [options.poweredBy.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.poweredBy.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.poweredBy.cssClasses.link] CSS class to add to the link element
 * @param  {boolean} [options.wrapInput=true] Wrap the input in a `div.ais-search-box`
 * @param  {boolean|string} [autofocus='auto'] autofocus on the input
 * @param  {boolean} [options.searchOnEnterKeyPressOnly=false] If set, trigger the search
 * once `<Enter>` is pressed only
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the
 * wrapping div (if `wrapInput` set to `true`)
 * @param  {string|string[]} [options.cssClasses.input] CSS class to add to the input
 * @param  {function} [options.queryHook] A function that will be called every time a new search would be done. You
 * will get the query as first parameter and a search(query) function to call as the second parameter.
 * This queryHook can be used to debounce the number of searches done from the searchBox.
 * @return {Object}
 */

const usage = `Usage:
searchBox({
  container,
  [ placeholder ],
  [ cssClasses.{input,poweredBy} ],
  [ poweredBy=false || poweredBy.{template, cssClasses.{root,link}} ],
  [ wrapInput ],
  [ autofocus ],
  [ searchOnEnterKeyPressOnly ],
  [ queryHook ]
})`;
function searchBox({
  container,
  placeholder = '',
  cssClasses = {},
  poweredBy = false,
  wrapInput = true,
  autofocus = 'auto',
  searchOnEnterKeyPressOnly = false,
  queryHook
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

  container = getContainerNode(container);

  // Only possible values are 'auto', true and false
  if (typeof autofocus !== 'boolean') {
    autofocus = 'auto';
  }

  // Convert to object if only set to true
  if (poweredBy === true) {
    poweredBy = {};
  }

  return {
    getInput() {
      // Returns reference to targeted input if present, or create a new one
      if (container.tagName === 'INPUT') {
        return container;
      }
      return document.createElement('input');
    },
    wrapInput(input) {
      // Wrap input in a .ais-search-box div
      const wrapper = document.createElement('div');
      const CSSClassesToAdd = cx(bem(null), cssClasses.root).split(' ');
      CSSClassesToAdd.forEach(cssClass => wrapper.classList.add(cssClass));
      wrapper.appendChild(input);
      return wrapper;
    },
    addDefaultAttributesToInput(input, query) {
      const defaultAttributes = {
        autocapitalize: 'off',
        autocomplete: 'off',
        autocorrect: 'off',
        placeholder,
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
      const CSSClassesToAdd = cx(bem('input'), cssClasses.input).split(' ');
      CSSClassesToAdd.forEach(cssClass => input.classList.add(cssClass));
    },
    addPoweredBy(input) {
      // Default values
      poweredBy = {
        cssClasses: {},
        template: defaultTemplates.poweredBy,
        ...poweredBy
      };

      const poweredByCSSClasses = {
        root: cx(bem('powered-by'), poweredBy.cssClasses.root),
        link: cx(bem('powered-by-link'), poweredBy.cssClasses.link)
      };

      const url = 'https://www.algolia.com/?' +
        'utm_source=instantsearch.js&' +
        'utm_medium=website&' +
        `utm_content=${location.hostname}&` +
        'utm_campaign=poweredby';

      const templateData = {
        cssClasses: poweredByCSSClasses,
        url
      };

      const template = poweredBy.template;
      let stringNode;

      if (isString(template)) {
        stringNode = Hogan.compile(template).render(templateData);
      }
      if (isFunction(template)) {
        stringNode = template(templateData);
      }

      // Crossbrowser way to create a DOM node from a string. We wrap in
      // a `span` to make sure we have one and only one node.
      const tmpNode = document.createElement('div');
      tmpNode.innerHTML = `<span>${stringNode.trim()}</span>`;
      const htmlNode = tmpNode.firstChild;

      input.parentNode.insertBefore(htmlNode, input.nextSibling);
    },
    init({state, helper, onHistoryChange}) {
      const isInputTargeted = container.tagName === 'INPUT';
      const input = this._input = this.getInput();
      let previousQuery;

      // Add all the needed attributes and listeners to the input
      this.addDefaultAttributesToInput(input, state.query);

      // always set the query every keystrokes when there's no queryHook
      if (!queryHook) {
        addListener(input, INPUT_EVENT, getInputValueAndCall(setQuery));
      }

      // search on enter
      if (searchOnEnterKeyPressOnly) {
        addListener(input, 'keyup', ifKey(KEY_ENTER, getInputValueAndCall(maybeSearch)));
      } else {
        addListener(input, INPUT_EVENT, getInputValueAndCall(maybeSearch));

        // handle IE8 weirdness where BACKSPACE key will not trigger an input change..
        // can be removed as soon as we remove support for it
        if (INPUT_EVENT === 'propertychange' || window.attachEvent) {
          addListener(input, 'keyup', ifKey(KEY_SUPPRESS, getInputValueAndCall(setQuery)));
          addListener(input, 'keyup', ifKey(KEY_SUPPRESS, getInputValueAndCall(maybeSearch)));
        }
      }

      function maybeSearch(query) {
        if (queryHook) {
          queryHook(query, setQueryAndSearch);
          return;
        }

        search(query);
      }

      function setQuery(query) {
        if (query !== helper.state.query) {
          previousQuery = helper.state.query;
          helper.setQuery(query);
        }
      }

      function search(query) {
        if (previousQuery !== undefined && previousQuery !== query) helper.search();
      }

      function setQueryAndSearch(query) {
        setQuery(query);
        search(query);
      }

      if (isInputTargeted) {
        // To replace the node, we need to create an intermediate node
        const placeholderNode = document.createElement('div');
        input.parentNode.insertBefore(placeholderNode, input);
        const parentNode = input.parentNode;
        const wrappedInput = wrapInput ? this.wrapInput(input) : input;
        parentNode.replaceChild(wrappedInput, placeholderNode);
      } else {
        const wrappedInput = wrapInput ? this.wrapInput(input) : input;
        container.appendChild(wrappedInput);
      }

      // Optional "powered by Algolia" widget
      if (poweredBy) {
        this.addPoweredBy(input);
      }

      // Update value when query change outside of the input
      onHistoryChange(fullState => {
        input.value = fullState.query || '';
      });

      // When the page is coming from BFCache
      // (https://developer.mozilla.org/en-US/docs/Working_with_BFCache)
      // then we force the input value to be the current query
      // Otherwise, this happens:
      // - <input> autocomplete = off (default)
      // - search $query
      // - navigate away
      // - use back button
      // - input query is empty (because <input> autocomplete = off)
      window.addEventListener('pageshow', () => {
        input.value = helper.state.query;
      });

      if (autofocus === true || autofocus === 'auto' && helper.state.query === '') {
        input.focus();
        input.setSelectionRange(helper.state.query.length, helper.state.query.length);
      }
    },
    render({helper}) {
      // updating the query from the outside using the helper
      // will fall in this case
      // If the input is focused, we do not update it.
      if (document.activeElement === this._input) {
        return;
      }

      if (helper.state.query !== this._input.value) {
        this._input.value = helper.state.query;
      }
    }
  };
}

function addListener(el, type, fn) {
  if (el.addEventListener) {
    el.addEventListener(type, fn);
  } else {
    el.attachEvent(`on${type}`, fn);
  }
}

function getValue(e) {
  return (e.currentTarget ? e.currentTarget : e.srcElement).value;
}

function ifKey(expectedKeyCode, func) {
  return actualEvent => actualEvent.keyCode === expectedKeyCode && func(actualEvent);
}

function getInputValueAndCall(func) {
  return actualEvent => func(getValue(actualEvent));
}

export default searchBox;
