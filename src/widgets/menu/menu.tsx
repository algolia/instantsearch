/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import type { RefinementListComponentCSSClasses } from '../../components/RefinementList/RefinementList';
import RefinementList from '../../components/RefinementList/RefinementList';
import type {
  MenuConnectorParams,
  MenuRenderState,
  MenuWidgetDescription,
} from '../../connectors/menu/connectMenu';
import connectMenu from '../../connectors/menu/connectMenu';
import defaultTemplates from './defaultTemplates';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import type { Renderer, Template, WidgetFactory } from '../../types';
import searchBoxDefaultTemplates from '../search-box/defaultTemplates';
import type { PreparedTemplateProps } from '../../lib/utils';
import type { SearchBoxTemplates } from '../search-box/search-box';
import type { SearchBoxComponentTemplates } from '../../components/SearchBox/SearchBox';

const withUsage = createDocumentationMessageGenerator({ name: 'menu' });
const suit = component('Menu');
const searchBoxSuit = component('SearchBox');

export type MenuOwnCSSClasses = Partial<{
  /**
   * CSS class to add to the root element.
   */
  root: string | string[];
  /**
   * CSS class to add to the root element when no refinements.
   */
  noRefinementRoot: string | string[];
  /**
   * CSS class to add to the list element.
   */
  list: string | string[];
  /**
   * CSS class to add to each item element.
   */
  item: string | string[];
  /**
   * CSS class to add to each selected item element.
   */
  selectedItem: string | string[];
  /**
   * CSS class to add to each link (when using the default template).
   */
  link: string | string[];
  /**
   * CSS class to add to each label (when using the default template).
   */
  label: string | string[];
  /**
   * CSS class to add to each count element (when using the default template).
   */
  count: string | string[];
  /**
   * CSS class to add to the show more button.
   */
  showMore: string | string[];
  /**
   * CSS class to add to the disabled show more button.
   */
  disabledShowMore: string | string[];
  /**
   * CSS class to add to the searchable container.
   */
  searchBox: string | string[];
}>;

type MenuSearchableCSSClasses = Partial<{
  searchableRoot: string | string[];
  searchableForm: string | string[];
  searchableInput: string | string[];
  searchableSubmit: string | string[];
  searchableSubmitIcon: string | string[];
  searchableReset: string | string[];
  searchableResetIcon: string | string[];
  searchableLoadingIndicator: string | string[];
  searchableLoadingIcon: string | string[];
}>;

export type MenuCSSClasses = MenuOwnCSSClasses & MenuSearchableCSSClasses;

export type MenuOwnTemplates = Partial<{
  /**
   * Item template. The string template gets the same values as the function.
   */
  item: Template<{
    count: number;
    cssClasses: MenuCSSClasses;
    isRefined: boolean;
    label: string;
    url: string;
    value: string;
    /**
     * The label highlighted (when using search for facet values). This value is displayed in the default template.
     */
    highlighted: string;
    /**
     * Whether the `items` prop contains facet values from the global search or from the search inside the items.
     */
    isFromSearch: boolean;
  }>;
  /**
   * Template used for the show more text, provided with `isShowingMore` data property.
   */
  showMoreText: Template<{
    isShowingMore: boolean;
  }>;
  /**
   * Templates to use for search for facet values when there are no results.
   */
  searchableNoResults: Template;
}>;

export type MenuComponentCSSClasses = RefinementListComponentCSSClasses;

export type MenuComponentTemplates = Required<MenuOwnTemplates>;

type MenuSearchableTemplates = Partial<{
  /**
   * Templates to use for search for facet values submit button.
   */
  searchableSubmit: SearchBoxTemplates['submit'];
  /**
   * Templates to use for search for facet values reset button.
   */
  searchableReset: SearchBoxTemplates['reset'];
  /**
   * Templates to use for the search for facet values loading indicator.
   */
  searchableLoadingIndicator: SearchBoxTemplates['loadingIndicator'];
}>;

export type MenuTemplates = MenuOwnTemplates & MenuSearchableTemplates;

export type MenuWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;
  /**
   * Customize the output through templating.
   */
  templates?: MenuTemplates;
  /**
   * Add a search input to let the user search for more facet values. In order
   * to make this feature work, you need to make the attribute searchable
   * [using the API](https://www.algolia.com/doc/guides/searching/faceting/?language=js#declaring-a-searchable-attribute-for-faceting)
   * or [the dashboard](https://www.algolia.com/explorer/display/)
   */
  searchable?: boolean;
  /**
   * Value of the search field placeholder.
   */
  searchablePlaceholder?: string;
  /**
   * When `false` the search field will become disabled if there are less items
   * to display than the `options.limit`, otherwise the search field is always usable.
   */
  searchableIsAlwaysActive?: boolean;
  /**
   * When activated, it will escape the facet values that are returned from Algolia.
   * In this case, the surrounding tags will always be `<mark></mark>`.
   */
  searchableEscapeFacetValues?: boolean;
  /**
   * CSS classes to add to the wrapping elements.
   */
  cssClasses?: MenuCSSClasses;
};

const renderer =
  ({
    containerNode,
    cssClasses,
    renderState,
    templates,
    searchBoxTemplates,
    showMore,
    searchable,
    searchablePlaceholder,
    searchableIsAlwaysActive,
  }: {
    containerNode: HTMLElement;
    cssClasses: MenuComponentCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<MenuComponentTemplates>;
      searchBoxTemplateProps?: PreparedTemplateProps<SearchBoxComponentTemplates>;
    };
    templates: MenuTemplates;
    searchBoxTemplates: SearchBoxTemplates;
    searchable?: boolean;
    searchablePlaceholder?: string;
    searchableIsAlwaysActive?: boolean;
    showMore?: boolean;
  }): Renderer<MenuRenderState, MenuConnectorParams> =>
  (
    {
      refine,
      items,
      createURL,
      searchForItems,
      isFromSearch,
      instantSearchInstance,
      isShowingMore,
      toggleShowMore,
      canToggleShowMore,
      hasExhaustiveItems,
    },
    isFirstRendering: boolean
  ) => {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });
      renderState.searchBoxTemplateProps = prepareTemplateProps({
        defaultTemplates: searchBoxDefaultTemplates,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates: searchBoxTemplates,
      });
      return;
    }

    const facetValues = items.map((facetValue) => ({
      ...facetValue,
      url: createURL(facetValue.value),
    }));

    render(
      <RefinementList
        createURL={createURL}
        cssClasses={cssClasses}
        facetValues={facetValues}
        showMore={showMore && !isFromSearch && items.length > 0}
        templateProps={renderState.templateProps!}
        searchBoxTemplateProps={renderState.searchBoxTemplateProps}
        searchFacetValues={searchable ? searchForItems : undefined}
        searchPlaceholder={searchablePlaceholder}
        searchIsAlwaysActive={searchableIsAlwaysActive}
        isFromSearch={isFromSearch}
        toggleRefinement={refine}
        toggleShowMore={toggleShowMore}
        isShowingMore={isShowingMore}
        hasExhaustiveItems={hasExhaustiveItems}
        canToggleShowMore={canToggleShowMore}
      />,
      containerNode
    );
  };

export type MenuWidget = WidgetFactory<
  MenuWidgetDescription & { $$widgetType: 'ais.menu' },
  MenuConnectorParams,
  MenuWidgetParams
>;

const menu: MenuWidget = function menu(widgetParams) {
  const {
    container,
    attribute,
    sortBy,
    limit,
    showMore,
    showMoreLimit,
    searchable = false,
    searchablePlaceholder = 'Search...',
    searchableEscapeFacetValues = true,
    searchableIsAlwaysActive = true,
    cssClasses: userCssClasses = {},
    templates = {},
    transformItems,
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const escapeFacetValues = searchable
    ? Boolean(searchableEscapeFacetValues)
    : false;

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    noRefinementRoot: cx(
      suit({ modifierName: 'noRefinement' }),
      userCssClasses.noRefinementRoot
    ),
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
    selectedItem: cx(
      suit({ descendantName: 'item', modifierName: 'selected' }),
      userCssClasses.selectedItem
    ),
    searchBox: cx(
      suit({ descendantName: 'searchBox' }),
      userCssClasses.searchBox
    ),
    link: cx(suit({ descendantName: 'link' }), userCssClasses.link),
    label: cx(suit({ descendantName: 'label' }), userCssClasses.label),
    count: cx(suit({ descendantName: 'count' }), userCssClasses.count),
    showMore: cx(suit({ descendantName: 'showMore' }), userCssClasses.showMore),
    disabledShowMore: cx(
      suit({ descendantName: 'showMore', modifierName: 'disabled' }),
      userCssClasses.disabledShowMore
    ),
    searchable: {
      root: cx(searchBoxSuit(), userCssClasses.searchableRoot),
      form: cx(
        searchBoxSuit({ descendantName: 'form' }),
        userCssClasses.searchableForm
      ),
      input: cx(
        searchBoxSuit({ descendantName: 'input' }),
        userCssClasses.searchableInput
      ),
      submit: cx(
        searchBoxSuit({ descendantName: 'submit' }),
        userCssClasses.searchableSubmit
      ),
      submitIcon: cx(
        searchBoxSuit({ descendantName: 'submitIcon' }),
        userCssClasses.searchableSubmitIcon
      ),
      reset: cx(
        searchBoxSuit({ descendantName: 'reset' }),
        userCssClasses.searchableReset
      ),
      resetIcon: cx(
        searchBoxSuit({ descendantName: 'resetIcon' }),
        userCssClasses.searchableResetIcon
      ),
      loadingIndicator: cx(
        searchBoxSuit({ descendantName: 'loadingIndicator' }),
        userCssClasses.searchableLoadingIndicator
      ),
      loadingIcon: cx(
        searchBoxSuit({ descendantName: 'loadingIcon' }),
        userCssClasses.searchableLoadingIcon
      ),
    },
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
    searchBoxTemplates: {
      submit: templates.searchableSubmit,
      reset: templates.searchableReset,
      loadingIndicator: templates.searchableLoadingIndicator,
    },
    searchable,
    searchablePlaceholder,
    searchableIsAlwaysActive,
    showMore,
  });

  const makeWidget = connectMenu(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      attribute,
      limit,
      showMore,
      showMoreLimit,
      sortBy,
      transformItems,
      escapeFacetValues,
    }),
    $$widgetType: 'ais.menu',
  };
};

export default menu;
