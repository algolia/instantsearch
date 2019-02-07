import forEach from 'lodash/forEach';
import cx from 'classnames';
import { getContainerNode, renderTemplate } from '../../lib/utils';
import connectSearchBox, {
  SearchBoxConnectorParams,
  SearchBoxRenderer,
} from '../../connectors/search-box/connectSearchBox';
import { component } from '../../lib/suit';
import { CreateWidget } from '../../types';
import defaultTemplates from './defaultTemplates';

type CreateSearchBox = CreateWidget<SearchBoxWidgetParams>;

// We have to use two types because they are not compatible. Maybe we can find
// a solution to make one out of the other. But it's really two different kind
// of types.

interface SearchBoxWidgetParams extends SearchBoxConnectorParams {
  container: string | HTMLElement;
  placeholder?: string;
  autofocus?: boolean;
  searchAsYouType?: boolean;
  showReset?: boolean;
  showSubmit?: boolean;
  showLoadingIndicator?: boolean;
  cssClasses?: Partial<SearchBoxCSSClasses>;
  templates?: Partial<SearchBoxTemplates>;
}

interface SearchBoxConnectorWidgetParams extends SearchBoxConnectorParams {
  container: HTMLElement;
  placeholder: string;
  autofocus: boolean;
  searchAsYouType: boolean;
  showReset: boolean;
  showSubmit: boolean;
  showLoadingIndicator: boolean;
  cssClasses: SearchBoxCSSClasses;
  templates: SearchBoxTemplates;
}

interface SearchBoxCSSClasses {
  root: string;
  form: string;
  input: string;
  submit: string;
  submitIcon: string;
  reset: string;
  resetIcon: string;
  loadingIndicator: string;
  loadingIcon: string;
}

interface SearchBoxTemplates {
  reset: string;
  submit: string;
  loadingIndicator: string;
}

const suit = component('SearchBox');

const renderer: SearchBoxRenderer<SearchBoxConnectorWidgetParams> = (
  { refine, clear, query, onHistoryChange, isSearchStalled, widgetParams },
  isFirstRender
) => {
  const {
    container,
    placeholder,
    cssClasses,
    autofocus,
    searchAsYouType,
    showReset,
    showSubmit,
    showLoadingIndicator,
    templates,
  } = widgetParams;

  if (isFirstRender) {
    const input = document.createElement('input');
    const wrappedInput = wrapInputFn(input, cssClasses);
    container.appendChild(wrappedInput);

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
        refine((event.currentTarget as HTMLInputElement).value);
      });
      form!.addEventListener('submit', event => {
        event.preventDefault();
        input.blur();
      });
    } else {
      input.addEventListener('input', event => {
        refine((event.currentTarget as HTMLInputElement).value);
      });
      form!.addEventListener('submit', event => {
        refine(input.value);
        event.preventDefault();
        input.blur();
      });
    }

    return;
  }

  const input = container.querySelector('input');
  const isFocused = document.activeElement === input;

  if (!isFocused && query !== input!.value) {
    input!.value = query;
  }

  if (showLoadingIndicator) {
    const loadingIndicatorElement = container.querySelector(
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
    const resetElement = container.querySelector(`.${cssClasses.reset}`);

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

const searchBox: CreateSearchBox = widgetParams => {
  if (!widgetParams) {
    throw new Error('Usage');
  }

  if (!widgetParams.container) {
    throw new Error('Usage');
  }

  const {
    container,
    queryHook,
    placeholder = '',
    cssClasses: userCssClasses = {},
    templates: userTemplates = {},
    autofocus = false,
    searchAsYouType = true,
    showReset = true,
    showSubmit = true,
    showLoadingIndicator = true,
  } = widgetParams;

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

  const cssClasses: SearchBoxCSSClasses = {
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

  const templates: SearchBoxTemplates = {
    ...defaultTemplates,
    ...userTemplates,
  };

  try {
    const makeWidget = connectSearchBox(renderer, disposer(containerNode));

    return makeWidget({
      container: containerNode,
      placeholder,
      cssClasses,
      autofocus,
      searchAsYouType,
      showReset,
      showSubmit,
      showLoadingIndicator,
      queryHook,
      templates,
    });
  } catch (error) {
    throw new Error('Error');
  }
};

export default searchBox;
