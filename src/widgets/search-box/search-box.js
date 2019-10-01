/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import connectSearchBox from '../../connectors/search-box/connectSearchBox';
import SearchBox from '../../components/SearchBox/SearchBox';
import defaultTemplates from './defaultTemplates';

const withUsage = createDocumentationMessageGenerator({ name: 'search-box' });
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
}) => ({ refine, query, isSearchStalled }) => {
  render(
    <SearchBox
      query={query}
      placeholder={placeholder}
      autofocus={autofocus}
      refine={refine}
      searchAsYouType={searchAsYouType}
      templates={templates}
      showSubmit={showSubmit}
      showReset={showReset}
      showLoadingIndicator={showLoadingIndicator}
      isSearchStalled={isSearchStalled}
      cssClasses={cssClasses}
    />,
    containerNode
  );
};

/**
 * @typedef {Object} SearchBoxTemplates
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
 * search.addWidgets([
 *   instantsearch.widgets.searchBox({
 *     container: '#q',
 *     placeholder: 'Search for products',
 *   })
 * ]);
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
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

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

  const makeWidget = connectSearchBox(specializedRenderer, () =>
    render(null, containerNode)
  );

  return makeWidget({ queryHook });
}
