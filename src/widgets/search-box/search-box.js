import forEach from 'lodash/forEach';
import cx from 'classnames';
import { getContainerNode, renderTemplate } from '../../lib/utils';
import connectSearchBox from '../../connectors/search-box/connectSearchBox';
import defaultTemplates from './defaultTemplates';
import { component } from '../../lib/suit';

const suit = component('SearchBox');

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
}) => (
  { refine, clear, query, onHistoryChange, isSearchStalled },
  isFirstRendering
) => {
  if (isFirstRendering) {
    const input = document.createElement('input');
    const wrappedInput = wrapInputFn(input, cssClasses);
    containerNode.appendChild(wrappedInput);

    if (showSubmit) {
      addSubmit(input, cssClasses, templates);
    }
    if (showReset) {
      addReset(input, cssClasses, templates, clear);
    }
    if (showLoadingIndicator) {
      addLoadingIndicator(input, cssClasses, templates);
    }

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

    if (autofocus === true) {
      input.focus();
      input.setSelectionRange(query.length, query.length);
    }

    const form = input.parentElement;

    if (searchAsYouType) {
      input.addEventListener('input', event => {
        refine(event.currentTarget.value);
      });
      form.addEventListener('submit', event => {
        event.preventDefault();
        input.blur();
      });
    } else {
      input.addEventListener('input', event => {
        refine(event.currentTarget.value, false);
      });
      form.addEventListener('submit', event => {
        refine(input.value);
        event.preventDefault();
        input.blur();
      });
    }

    return;
  }

  const input = containerNode.querySelector('input');
  const isFocused = document.activeElement === input;

  if (!isFocused && query !== input.value) {
    input.value = query;
  }

  if (showLoadingIndicator) {
    const loadingIndicatorElement = containerNode.querySelector(
      `.${cssClasses.loadingIndicator}`
    );

    if (loadingIndicatorElement) {
      if (isSearchStalled) {
        loadingIndicatorElement.removeAttribute('hidden');
      } else {
        loadingIndicatorElement.setAttribute('hidden', '');
      }
    }
  }

  if (showReset) {
    const resetElement = containerNode.querySelector(`.${cssClasses.reset}`);

    if (resetElement) {
      const isUserTyping = Boolean(query && query.trim());

      if (isUserTyping && !isSearchStalled) {
        resetElement.removeAttribute('hidden');
      } else {
        resetElement.setAttribute('hidden', '');
      }
    }
  }
};

const disposer = containerNode => () => {
  const range = document.createRange(); // IE10+
  range.selectNodeContents(containerNode);
  range.deleteContents();
};

const usage = `Usage:
searchBox({
  container,
  [ placeholder ],
  [ cssClasses.{root, form, input, submit, submitIcon, reset, resetIcon, loadingIndicator, loadingIcon} ],
  [ autofocus = false ],
  [ searchAsYouType = true ],
  [ showReset = true ],
  [ showSubmit = true ],
  [ showLoadingIndicator = true ],
  [ queryHook ],
  [ templates.{reset, submit, loadingIndicator} ],
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
 * @property {string|string[]} [submit] CSS classes added to the submit button.
 * @property {string|string[]} [submitIcon] CSS classes added to the submit icon.
 * @property {string|string[]} [reset] CSS classes added to the reset button.
 * @property {string|string[]} [resetIcon] CSS classes added to the reset icon.
 * @property {string|string[]} [loadingIndicator] CSS classes added to the loading indicator element.
 * @property {string|string[]} [loadingIcon] CSS classes added to the loading indicator icon.
 */

/**
 * @typedef {Object} SearchBoxWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget
 * @property {string} [placeholder] The placeholder of the input
 * @property {boolean} [autofocus=false] Whether the input should be autofocused
 * @property {boolean} [searchAsYouType=true] If set, trigger the search
 * once `<Enter>` is pressed only.
 * @property {boolean} [showReset=true] Whether to show the reset button
 * @property {boolean} [showSubmit=true] Whether to show the submit button
 * @property {boolean} [showLoadingIndicator=true] Whether to show the loading indicator (replaces the submit if
 * the search is stalled)
 * @property {SearchBoxCSSClasses} [cssClasses] CSS classes to add
 * @property {SearchBoxTemplates} [templates] Templates used for customizing the rendering of the searchbox
 * @property {function} [queryHook] A function that is called every time a new search is done. You
 * will get the query as the first parameter and a search (query) function to call as the second parameter.
 * This `queryHook` can be used to debounce the number of searches done from the search box.
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
 *   })
 * );
 */
export default function searchBox({
  container,
  placeholder = '',
  cssClasses: userCssClasses = {},
  autofocus = false,
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
      `[InstantSearch.js] Since in version 3, \`container\` can not be an \`input\` anymore.

Learn more in the [migration guide](https://community.algolia.com/instantsearch.js/v3/guides/v3-migration.html).`
    );
  }

  // eslint-disable-next-line
  // FIXME: the link should be updated when the documentation is migrated in the main Algolia doc
  if (typeof autofocus !== 'boolean') {
    throw new Error(
      `[InstantSearch.js] Since in version 3, \`autofocus\` only supports boolean values.

Learn more in the [migration guide](https://community.algolia.com/instantsearch.js/v3/guides/v3-migration.html).`
    );
  }

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    form: cx(suit({ descendantName: 'form' }), userCssClasses.form),
    input: cx(suit({ descendantName: 'input' }), userCssClasses.input),
    submit: cx(suit({ descendantName: 'submit' }), userCssClasses.submit),
    submitIcon: cx(
      suit({ descendantName: 'submitIcon' }),
      userCssClasses.submitIcon
    ),
    reset: cx(suit({ descendantName: 'reset' }), userCssClasses.reset),
    resetIcon: cx(
      suit({ descendantName: 'resetIcon' }),
      userCssClasses.resetIcon
    ),
    loadingIndicator: cx(
      suit({ descendantName: 'loadingIndicator' }),
      userCssClasses.loadingIndicator
    ),
    loadingIcon: cx(
      suit({ descendantName: 'loadingIcon' }),
      userCssClasses.loadingIcon
    ),
  };

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
  } catch (error) {
    throw new Error(usage);
  }
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
  input.className = cssClasses.input;
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
    data: {
      cssClasses,
    },
  });

  const node = document.createElement('button');
  node.className = cssClasses.reset;
  node.setAttribute('hidden', '');
  node.type = 'reset';
  node.title = 'Clear the search query';
  node.innerHTML = stringNode;

  input.parentNode.appendChild(node);

  node.addEventListener('click', () => {
    input.focus();
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
    data: {
      cssClasses,
    },
  });

  const node = document.createElement('button');
  node.className = cssClasses.submit;
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
    data: {
      cssClasses,
    },
  });

  const node = document.createElement('span');
  node.setAttribute('hidden', '');
  node.className = cssClasses.loadingIndicator;
  node.innerHTML = stringNode;

  input.parentNode.appendChild(node);
}

function wrapInputFn(input, cssClasses) {
  const wrapper = document.createElement('div');
  wrapper.className = cssClasses.root;

  const form = document.createElement('form');
  form.className = cssClasses.form;
  form.noValidate = true;
  form.action = ''; // show search button on iOS keyboard

  form.appendChild(input);
  wrapper.appendChild(form);

  return wrapper;
}
