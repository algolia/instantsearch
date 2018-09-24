import forEach from 'lodash/forEach';
import cx from 'classnames';
import { getContainerNode, renderTemplate } from '../../lib/utils';
import connectSearchBox from '../../connectors/search-box/connectSearchBox';
import defaultTemplates from './defaultTemplates';

import { component } from '../../lib/suit';

const suit = component('SearchBox');

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
  showSubmit,
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

    if (showSubmit) addSubmit(input, cssClasses, templates);
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

    const form = input.parentElement;

    // search on enter
    if (!searchAsYouType) {
      addListener(input, INPUT_EVENT, e => {
        refine(getValue(e), false);
      });
      addListener(form, 'submit', e => {
        refine(input.value);
        e.preventDefault();
        input.blur();
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

      addListener(form, 'submit', e => {
        e.preventDefault();
      });
    }
  }

  renderAfterInit({
    containerNode,
    query,
    showLoadingIndicator,
    showReset,
    isUserTyping: Boolean(query && query.trim()),
    isSearchStalled,
  });
};

function renderAfterInit({
  containerNode,
  query,
  showLoadingIndicator,
  showReset,
  isUserTyping,
  isSearchStalled,
}) {
  const input = containerNode.querySelector('input');
  const isFocused = document.activeElement === input;
  if (!isFocused && query !== input.value) {
    input.value = query;
  }

  if (showLoadingIndicator) {
    const loadingIndicatorElement = containerNode.querySelector(
      `.${suit({ descendantName: 'loadingIndicator' })}`
    );
    const resetElement = containerNode.querySelector(
      `.${suit({ descendantName: 'reset' })}`
    );
    if (isSearchStalled) {
      loadingIndicatorElement.removeAttribute('hidden');
    } else {
      loadingIndicatorElement.setAttribute('hidden', '');
    }

    if (showReset) {
      if (isUserTyping && !isSearchStalled) {
        resetElement.removeAttribute('hidden');
      } else {
        resetElement.setAttribute('hidden', '');
      }
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
  [ cssClasses.{root, input, reset, submit, loadingIndicator} ],
  [ autofocus ],
  [ searchAsYouType = true ],
  [ queryHook ]
  [ templates.{reset, submit, loadingIndicator} ]
})`;

/**
 * @typedef {Ojbect} SearchBoxTemplates
 * @property {function|string} submit Template used for displaying the submit. Can accept a function or a Hogan string.
 * @property {function|string} reset Template used for displaying the button. Can accept a function or a Hogan string.
 * @property {function|string} loadingIndicator Template used for displaying the button. Can accept a function or a Hogan string.
 */

/**
 * @typedef {Object} SearchBoxCSSClasses
 * @property {string|string[]} [root] CSS class to add to the wrapping `<div>`
 * @property {string|string[]} [form] CSS class to add to the form
 * @property {string|string[]} [input] CSS class to add to the input.
 * @property {string|string[]} [reset] CSS classes added to the reset button.
 * @property {string|string[]} [loadingIndicator] CSS classes added to the loading-indicator element.
 * @property {string|string[]} [submit] CSS classes added to the submit.
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
 * @property {boolean} [showSubmit=true] Show/hide the submit button (acts as submit button)
 * @property {boolean} [showLoadingIndicator=true] Activates the loading indicator. (replaces the submit is
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
  showSubmit = true,
  showLoadingIndicator = true,
  queryHook,
  templates,
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  if (containerNode.tagName === 'INPUT') {
    // eslint-disable-next-line
    // FIXME: the link should be updated when the documentation is migrated in the main Algolia doc
    throw new Error(
      `Starting in V3, container can not be an INPUT anymore. If you have more questions, have a look at the [migration guide](https://community.algolia.com/instantsearch.js/v3/guides/migration.html).`
    );
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
    showSubmit,
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
  input.className = cx(suit({ descendantName: 'input' }), cssClasses.input);
}

/**
 * Adds a reset element in the searchbox widget. When this reset element is clicked on
 * it should reset the query.
 * @private
 * @param {HTMLElement} input the DOM node of the input of the searchbox
 * @param {object} cssClasses the object containing all the css classes
 * @param {object} templates the templates object
 * @param {function} clearFunction function called when the element is activated (clicked)
 * @returns {undefined} Modifies the input
 */
function addReset(input, cssClasses, templates, clearFunction) {
  const stringNode = renderTemplate({
    templateKey: 'reset',
    templates,
  });

  const node = document.createElement('button');
  node.className = cx(suit({ descendantName: 'reset' }), cssClasses.reset);
  node.type = 'reset';
  node.title = 'Clear the search query';
  node.innerHTML = stringNode;

  input.parentNode.appendChild(node);

  node.addEventListener('click', event => {
    event.preventDefault();
    clearFunction();
  });
}

/**
 * Adds a button with a magnifying glass in the searchbox widget
 * @private
 * @param {HTMLElement} input the DOM node of the input of the searchbox
 * @param {object} cssClasses the user options (cssClasses and template)
 * @param {object} templates the object containing all the templates
 * @returns {undefined} Modifies the input
 */
function addSubmit(input, cssClasses, templates) {
  const stringNode = renderTemplate({
    templateKey: 'submit',
    templates,
  });

  const node = document.createElement('button');
  node.className = cx(suit({ descendantName: 'submit' }), cssClasses.submit);
  node.type = 'submit';
  node.title = 'Submit the search query';
  node.innerHTML = stringNode;

  input.parentNode.appendChild(node);
}

/**
 * Adds a loading indicator (spinner) to the search box
 * @param {DomElement} input DOM element where to add the loading indicator
 * @param {Object} cssClasses css classes definition
 * @param {Object} templates templates of the widget
 * @returns {undefined} Modifies the input
 */
function addLoadingIndicator(input, cssClasses, templates) {
  const stringNode = renderTemplate({
    templateKey: 'loadingIndicator',
    templates,
  });

  const node = document.createElement('span');
  node.className = cx(
    suit({ descendantName: 'loadingIndicator' }),
    cssClasses.loadingIndicator
  );
  node.innerHTML = stringNode;

  input.parentNode.appendChild(node);
}

function wrapInputFn(input, cssClasses) {
  const wrapper = document.createElement('div');
  wrapper.className = cx(suit(), cssClasses.root);

  const form = document.createElement('form');
  form.className = cx(suit({ descendantName: 'form' }), cssClasses.form);
  form.noValidate = true;

  form.appendChild(input);
  wrapper.appendChild(form);
  return wrapper;
}
