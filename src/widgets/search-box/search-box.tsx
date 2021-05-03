/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { WidgetFactory, Template, RendererOptions } from '../../types';
import connectSearchBox, {
  SearchBoxConnectorParams,
  SearchBoxRenderState,
  SearchBoxWidgetDescription,
} from '../../connectors/search-box/connectSearchBox';
import SearchBox from '../../components/SearchBox/SearchBox';
import defaultTemplates from './defaultTemplates';

const withUsage = createDocumentationMessageGenerator({ name: 'search-box' });
const suit = component('SearchBox');

export type SearchBoxTemplates = {
  /**
   * Template used for displaying the submit button. Can accept a function or a Hogan string.
   */
  submit: Template;
  /**
   * Template used for displaying the reset button. Can accept a function or a Hogan string.
   */
  reset: Template;
  /**
   * Template used for displaying the loading indicator. Can accept a function or a Hogan string.
   */
  loadingIndicator: Template;
};

export type SearchBoxCSSClasses = {
  /**
   * CSS class to add to the wrapping `<div>`
   */
  root: string | string[];
  /**
   * CSS class to add to the form
   */
  form: string | string[];
  /**
   * CSS class to add to the input.
   */
  input: string | string[];
  /**
   * CSS classes added to the submit button.
   */
  submit: string | string[];
  /**
   * CSS classes added to the submit icon.
   */
  submitIcon: string | string[];
  /**
   * CSS classes added to the reset button.
   */
  reset: string | string[];
  /**
   * CSS classes added to the reset icon.
   */
  resetIcon: string | string[];
  /**
   * CSS classes added to the loading indicator element.
   */
  loadingIndicator: string | string[];
  /**
   * CSS classes added to the loading indicator icon.
   */
  loadingIcon: string | string[];
};

export type SearchBoxRendererCSSClasses = Required<
  {
    [key in keyof SearchBoxCSSClasses]: string;
  }
>;

export type SearchBoxWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget
   */
  container: string | HTMLElement;
  /**
   * The placeholder of the input
   */
  placeholder?: string;
  /**
   * Whether the input should be autofocused
   */
  autofocus?: boolean;
  /**
   * If set, trigger the search
   * once `<Enter>` is pressed only.
   */
  searchAsYouType?: boolean;
  /**
   * Whether to show the reset button
   */
  showReset?: boolean;
  /**
   * Whether to show the submit button
   */
  showSubmit?: boolean;
  /**
   * Whether to show the loading indicator (replaces the submit if
   * the search is stalled)
   */
  showLoadingIndicator?: boolean;
  /**
   * CSS classes to add
   */
  cssClasses?: Partial<SearchBoxCSSClasses>;

  /**
   * Templates used for customizing the rendering of the searchbox
   */
  templates?: Partial<SearchBoxTemplates>;
  /**
   * A function that is called every time a new search is done. You
   * will get the query as the first parameter and a search (query) function to call as the second parameter.
   * This `queryHook` can be used to debounce the number of searches done from the search box.
   */
  queryHook?: (query: string, hook: (value: string) => void) => void;
};

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
}: {
  containerNode: HTMLElement;
  cssClasses: SearchBoxRendererCSSClasses;
  placeholder: string;
  templates: SearchBoxTemplates;
  autofocus: boolean;
  searchAsYouType: boolean;
  showReset: boolean;
  showSubmit: boolean;
  showLoadingIndicator: boolean;
}) => ({
  refine,
  query,
  isSearchStalled,
}: SearchBoxRenderState & RendererOptions<SearchBoxConnectorParams>) => {
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
 * The searchbox widget is used to let the user set a text based query.
 *
 * This is usually the  main entry point to start the search in an instantsearch context. For that
 * reason is usually placed on top, and not hidden so that the user can start searching right
 * away.
 *
 */
export type SearchBoxWidget = WidgetFactory<
  SearchBoxWidgetDescription & { $$widgetType: 'ais.searchBox' },
  SearchBoxConnectorParams,
  SearchBoxWidgetParams
>;

const searchBox: SearchBoxWidget = function searchBox(widgetParams) {
  const {
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
  } = widgetParams || {};
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

  return {
    ...makeWidget({ queryHook }),
    $$widgetType: 'ais.searchBox',
  };
};

export default searchBox;
