import forEach from 'lodash/forEach';
import cx from 'classnames';
import { bemHelper, getContainerNode, renderTemplate } from '../../lib/utils';
import connectSearchBox from '../../connectors/search-box/connectSearchBox';
import defaultTemplates from './defaultTemplates';

const bem = bemHelper('ais-search-box');
const KEY_ENTER = 13;
const KEY_SUPPRESS = 8;

const renderer = ({
  containerNode,
  cssClasses,
  placeholder,
  templates,
  autofocus,
  searchAsYouType,
  showReset,
  showMagnifier,
  showLoadingIndicator,
  // eslint-disable-next-line complexity
}) => (
  { refine, clear, query, onHistoryChange, isSearchStalled },
  isFirstRendering
) => {
  if (isFirstRendering) {
    const INPUT_EVENT = window.addEventListener ? 'input' : 'propertychange';

    const input = document.createElement('input');
    const wrappedInput = wrapInputFn(input, cssClasses);
    containerNode.appendChild(wrappedInput);

    if (showMagnifier) addMagnifier(input, cssClasses, templates);
    if (showReset) addReset(input, cssClasses, templates, clear);
    if (showLoadingIndicator) addLoadingIndicator(input, cssClasses, templates);

    addDefaultAttributesToInput(placeholder, input, query, cssClasses);

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
      input.value = query;
    });

    // Update value when query change outside of the input
    onHistoryChange(fullState => {
      input.value = fullState.query || '';
    });

    if (autofocus === true || (autofocus === 'auto' && query === '')) {
      input.focus();
      input.setSelectionRange(query.length, query.length);
    }

    // search on enter
    if (!searchAsYouType) {
      addListener(input, INPUT_EVENT, e => {
        refine(getValue(e), false);
      });
      addListener(input, 'keyup', e => {
        if (e.keyCode === KEY_ENTER) refine(getValue(e));
      });
    } else {
      addListener(input, INPUT_EVENT, getInputValueAndCall(refine));

      // handle IE8 weirdness where BACKSPACE key will not trigger an input change..
      // can be removed as soon as we remove support for it
      if (INPUT_EVENT === 'propertychange' || window.attachEvent) {
        addListener(
          input,
          'keyup',
          ifKey(KEY_SUPPRESS, getInputValueAndCall(refine))
        );
      }
    }
  } else {
    renderAfterInit({
      containerNode,
      query,
      showLoadingIndicator,
      isSearchStalled,
    });
  }

  if (showReset) {
    const resetBtnSelector = `.${cx(bem('reset-wrapper'))}`;
    // hide reset button when there is no query
    const resetButton = containerNode.querySelector(resetBtnSelector);
    resetButton.style.display = query && query.trim() ? 'block' : 'none';
  }
};

function renderAfterInit({
  containerNode,
  query,
  showLoadingIndicator,
  isSearchStalled,
}) {
  const input = containerNode.querySelector('input');
  const isFocused = document.activeElement === input;
  if (!isFocused && query !== input.value) {
    input.value = query;
  }

  if (showLoadingIndicator) {
    const rootElement = containerNode.firstChild;
    if (isSearchStalled) {
      rootElement.classList.add('ais-stalled-search');
    } else {
      rootElement.classList.remove('ais-stalled-search');
    }
  }
}

const disposer = containerNode => () => {
  const range = document.createRange(); // IE10+
  range.selectNodeContents(containerNode);
  range.deleteContents();
};

const usage = `Usage:
searchBox({
  container,
  [ placeholder ],
  [ cssClasses.{root, input, reset, magnifier, loadingIndicator} ],
  [ autofocus ],
  [ searchAsYouType = true ],
  [ queryHook ]
  [ templates.{reset, magnifier, loadingIndicator} ]
})`;

/**
 * @typedef {Ojbect} SearchBoxTemplates
 * @property {function|string} magnifier Template used for displaying the magnifier. Can accept a function or a Hogan string.
 * @property {function|string} reset Template used for displaying the button. Can accept a function or a Hogan string.
 * @property {function|string} loadingIndicator Template used for displaying the button. Can accept a function or a Hogan string.
 */

/**
 * @typedef {Object} SearchBoxCSSClasses
 * @property {string|string[]} [root] CSS class to add to the wrapping `<div>`
 * @property {string|string[]} [input] CSS class to add to the input.
 * @property {string|string[]} [reset] CSS classes added to the reset button.
 * @property {string|string[]} [loadingIndicator] CSS classes added to the loading-indicator element.
 * @property {string|string[]} [magnifier] CSS classes added to the magnifier.
 */

/**
 * @typedef {Object} SearchBoxWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget. If the CSS
 * selector or the HTMLElement is an existing input, the widget will use it.
 * @property {string} [placeholder] Input's placeholder.
 * @property {boolean|string} [autofocus="auto"] autofocus on the input.
 * @property {boolean} [searchAsYouType=true] If set, trigger the search
 * once `<Enter>` is pressed only.
 * @property {boolean} [showReset=true] Show/hide the reset button
 * @property {boolean} [showMagnifier=true] Show/hide the magnifier button (acts as submit button)
 * @property {boolean} [showLoadingIndicator=true] Activates the loading indicator. (replaces the magnifier is
 * the search is stalled)
 * @property {SearchBoxCSSClasses} [cssClasses] CSS classes to add.
 * @property {SearchBoxTemplates} [templates] Templates used for customizing the rendering of the searchbox
 * @property {function} [queryHook] A function that will be called every time a new search would be done. You
 * will get the query as first parameter and a search(query) function to call as the second parameter.
 * This queryHook can be used to debounce the number of searches done from the searchBox.
 */

/**
 * The searchbox widget is used to let the user set a text based query.
 *
 * This is usually the  main entry point to start the search in an instantsearch context. For that
 * reason is usually placed on top, and not hidden so that the user can start searching right
 * away.
 *
 * @type {WidgetFactory}
 * @devNovel SearchBox
 * @category basic
 * @param {SearchBoxWidgetOptions} $0 Options used to configure a SearchBox widget.
 * @return {Widget} Creates a new instance of the SearchBox widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.searchBox({
 *     container: '#q',
 *     placeholder: 'Search for products',
 *     autofocus: false,
 *   })
 * );
 */
export default function searchBox({
  container,
  placeholder = '',
  cssClasses = {},
  autofocus = 'auto',
  searchAsYouType = true,
  showReset = true,
  showMagnifier = true,
  showLoadingIndicator = true,
  queryHook,
  templates,
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  if (containerNode.tagName === 'INPUT') {
    throw new Error(`container should not be an INPUT`);
  }

  // Only possible values are 'auto', true and false
  if (typeof autofocus !== 'boolean') {
    autofocus = 'auto';
  }

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    placeholder,
    templates: { ...defaultTemplates, ...templates },
    autofocus,
    searchAsYouType,
    showReset,
    showMagnifier,
    showLoadingIndicator,
  });

  try {
    const makeWidget = connectSearchBox(
      specializedRenderer,
      disposer(containerNode)
    );
    return makeWidget({ queryHook });
  } catch (e) {
    throw new Error(usage);
  }
}

// the 'input' event is triggered when the input value changes
// in any case: typing, copy pasting with mouse..
// 'onpropertychange' is the IE8 alternative until we support IE8
// but it's flawed: http://help.dottoro.com/ljhxklln.php

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
  return actualEvent =>
    actualEvent.keyCode === expectedKeyCode && func(actualEvent);
}

function getInputValueAndCall(func) {
  return actualEvent => func(getValue(actualEvent));
}

function addDefaultAttributesToInput(placeholder, input, query, cssClasses) {
  const defaultAttributes = {
    autocapitalize: 'off',
    autocomplete: 'off',
    autocorrect: 'off',
    placeholder,
    role: 'textbox',
    spellcheck: 'false',
    type: 'text',
    value: query,
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
}

/**
 * Adds a reset element in the searchbox widget. When this reset element is clicked on
 * it should reset the query.
 * @private
 * @param {HTMLElement} input the DOM node of the input of the searchbox
 * @param {object} cssClasses the object containing all the css classes
 * @param {object} templates the templates object
 * @param {function} clearFunction function called when the element is activated (clicked)
 * @returns {undefined} returns nothing
 */
function addReset(input, cssClasses, templates, clearFunction) {
  const resetCSSClasses = {
    root: cx(bem('reset'), cssClasses.reset),
  };

  const stringNode = renderTemplate({
    templateKey: 'reset',
    templates,
    data: {
      cssClasses: resetCSSClasses,
    },
  });

  const htmlNode = createNodeFromString(stringNode, cx(bem('reset-wrapper')));

  input.parentNode.appendChild(htmlNode);

  htmlNode.addEventListener('click', event => {
    event.preventDefault();
    clearFunction();
  });
}

/**
 * Adds a magnifying glass in the searchbox widget
 * @private
 * @param {HTMLElement} input the DOM node of the input of the searchbox
 * @param {object} cssClasses the user options (cssClasses and template)
 * @param {object} templates the object containing all the templates
 * @returns {undefined} returns nothing
 */
function addMagnifier(input, cssClasses, templates) {
  const magnifierCSSClasses = {
    root: cx(bem('magnifier'), cssClasses.magnifier),
  };

  const stringNode = renderTemplate({
    templateKey: 'magnifier',
    templates,
    data: {
      cssClasses: magnifierCSSClasses,
    },
  });

  const htmlNode = createNodeFromString(
    stringNode,
    cx(bem('magnifier-wrapper'))
  );

  input.parentNode.appendChild(htmlNode);
}

function addLoadingIndicator(input, cssClasses, templates) {
  const loadingIndicatorCSSClasses = {
    root: cx(bem('loading-indicator'), cssClasses.loadingIndicator),
  };

  const stringNode = renderTemplate({
    templateKey: 'loadingIndicator',
    templates,
    data: {
      cssClasses: loadingIndicatorCSSClasses,
    },
  });

  const htmlNode = createNodeFromString(
    stringNode,
    cx(bem('loading-indicator-wrapper'))
  );

  input.parentNode.appendChild(htmlNode);
}

// Cross-browser way to create a DOM node from a string. We wrap in
// a `span` to make sure we have one and only one node.
function createNodeFromString(stringNode, rootClassname = '') {
  const tmpNode = document.createElement('div');
  tmpNode.innerHTML = `<span class="${rootClassname}">${stringNode.trim()}</span>`;
  return tmpNode.firstChild;
}

function wrapInputFn(input, cssClasses) {
  // Wrap input in a .ais-search-box div
  const wrapper = document.createElement('div');
  const CSSClassesToAdd = cx(bem(null), cssClasses.root).split(' ');
  CSSClassesToAdd.forEach(cssClass => wrapper.classList.add(cssClass));
  wrapper.appendChild(input);
  return wrapper;
}
