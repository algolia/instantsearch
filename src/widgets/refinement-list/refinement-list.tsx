/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import RefinementList from '../../components/RefinementList/RefinementList';
import connectRefinementList, {
  RefinementListRenderState,
  RefinementListConnectorParams,
  RefinementListWidgetDescription,
} from '../../connectors/refinement-list/connectRefinementList';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { Template, WidgetFactory, RendererOptions } from '../../types';
import { PreparedTemplateProps } from '../../lib/utils/prepareTemplateProps';
import searchBoxDefaultTemplates from '../search-box/defaultTemplates';
import {
  SearchBoxTemplates,
  SearchBoxCSSClasses,
} from '../search-box/search-box';

const withUsage = createDocumentationMessageGenerator({
  name: 'refinement-list',
});
const suit = component('RefinementList');
const searchBoxSuit = component('SearchBox');

type RefinementListOwnTemplates = {
  /**
   * Item template, provided with `label`, `highlighted`, `value`, `count`, `isRefined`, `url` data properties.
   */
  item: Template<RefinementListItemData>;
  /**
   * Template used for the show more text, provided with `isShowingMore` data property.
   */
  showMoreText: Template;
  /**
   * Templates to use for search for facet values when there are no results.
   */
  searchableNoResults: Template;
};

type RefinementListSearchableTemplates = {
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
};

export type RefinementListTemplates = RefinementListSearchableTemplates &
  RefinementListOwnTemplates;

export type RefinementListItemData = {
  /**
   * The number of occurrences of the facet in the result set.
   */
  count: number;
  /**
   * True if the value is selected.
   */
  isRefined: boolean;
  /**
   * The label to display.
   */
  label: string;
  /**
   * The value used for refining.
   */
  value: string;
  /**
   * The label highlighted (when using search for facet values). This value is displayed in the default template.
   */
  highlighted: string;
  /**
   * The url with this refinement selected.
   */
  url: string;
  /**
   * Object containing all the classes computed for the item.
   */
  cssClasses: RefinementListCSSClasses;
};

type RefinementListOwnCSSClasses = {
  /**
   * CSS class to add to the root element.
   */
  root: string | string[];
  /**
   * CSS class to add to the root element when no refinements.
   */
  noRefinementRoot: string | string[];
  /**
   * CSS class to add to the root element with no results.
   */
  noResults: string | string[];
  /**
   * CSS class to add to the list element.
   */
  list: string | string[];
  /**
   * CSS class to add to each item element.
   */
  item: string | string[];
  /**
   * CSS class to add to each selected element.
   */
  selectedItem: string | string[];
  /**
   * CSS class to add to each label element (when using the default template).
   */
  label: string | string[];
  /**
   * CSS class to add to each checkbox element (when using the default template).
   */
  checkbox: string | string[];
  /**
   * CSS class to add to each label text element.
   */
  labelText: string | string[];
  /**
   * CSS class to add to the show more element
   */
  showMore: string | string[];
  /**
   * CSS class to add to the disabled show more element
   */
  disabledShowMore: string | string[];
  /**
   * CSS class to add to each count element (when using the default template).
   */
  count: string | string[];
  /**
   * CSS class to add to the searchable container.
   */
  searchBox: string | string[];
};

type RefinementListSearchableCSSClasses = {
  searchableRoot: string | string[];
  searchableForm: string | string[];
  searchableInput: string | string[];
  searchableSubmit: string | string[];
  searchableSubmitIcon: string | string[];
  searchableReset: string | string[];
  searchableResetIcon: string | string[];
  searchableLoadingIndicator: string | string[];
  searchableLoadingIcon: string | string[];
};

export type RefinementListCSSClasses = RefinementListOwnCSSClasses &
  RefinementListSearchableCSSClasses;

export type RefinementListRendererCSSClasses = {
  [key in keyof RefinementListOwnCSSClasses]: string;
} & {
  searchable: {
    [key in keyof SearchBoxCSSClasses]: string;
  };
};

export type RefinementListWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;
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
   * Templates to use for the widget.
   */
  templates?: Partial<RefinementListTemplates>;
  /**
   * CSS classes to add to the wrapping elements.
   */
  cssClasses?: Partial<RefinementListCSSClasses>;
};

export const defaultTemplates: RefinementListOwnTemplates = {
  item: `<label class="{{cssClasses.label}}">
  <input type="checkbox"
         class="{{cssClasses.checkbox}}"
         value="{{value}}"
         {{#isRefined}}checked{{/isRefined}} />
  <span class="{{cssClasses.labelText}}">{{#isFromSearch}}{{{highlighted}}}{{/isFromSearch}}{{^isFromSearch}}{{highlighted}}{{/isFromSearch}}</span>
  <span class="{{cssClasses.count}}">{{#helpers.formatNumber}}{{count}}{{/helpers.formatNumber}}</span>
</label>`,
  showMoreText: `
    {{#isShowingMore}}
      Show less
    {{/isShowingMore}}
    {{^isShowingMore}}
      Show more
    {{/isShowingMore}}
    `,
  searchableNoResults: 'No results',
};

const renderer = ({
  containerNode,
  cssClasses,
  templates,
  searchBoxTemplates,
  renderState,
  showMore,
  searchable,
  searchablePlaceholder,
  searchableIsAlwaysActive,
}: {
  containerNode: HTMLElement;
  cssClasses: RefinementListRendererCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<RefinementListOwnTemplates>;
    searchBoxTemplateProps?: PreparedTemplateProps<SearchBoxTemplates>;
  };
  templates: Partial<RefinementListOwnTemplates>;
  searchBoxTemplates: Partial<SearchBoxTemplates>;
  showMore?: boolean;
  searchable?: boolean;
  searchablePlaceholder?: string;
  searchableIsAlwaysActive?: boolean;
}) => (
  {
    refine,
    items,
    createURL,
    searchForItems,
    isFromSearch,
    instantSearchInstance,
    toggleShowMore,
    isShowingMore,
    hasExhaustiveItems,
    canToggleShowMore,
  }: RefinementListRenderState & RendererOptions<RefinementListConnectorParams>,
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

  render(
    <RefinementList
      createURL={createURL}
      cssClasses={cssClasses}
      facetValues={items}
      templateProps={renderState.templateProps}
      searchBoxTemplateProps={renderState.searchBoxTemplateProps}
      toggleRefinement={refine}
      searchFacetValues={searchable ? searchForItems : undefined}
      searchPlaceholder={searchablePlaceholder}
      searchIsAlwaysActive={searchableIsAlwaysActive}
      isFromSearch={isFromSearch}
      showMore={showMore && !isFromSearch && items.length > 0}
      toggleShowMore={toggleShowMore}
      isShowingMore={isShowingMore}
      hasExhaustiveItems={hasExhaustiveItems}
      canToggleShowMore={canToggleShowMore}
    />,
    containerNode
  );
};

export type RefinementListWidget = WidgetFactory<
  RefinementListWidgetDescription & { $$widgetType: 'ais.refinementList' },
  RefinementListConnectorParams,
  RefinementListWidgetParams
>;

/**
 * The refinement list widget is one of the most common widget that you can find
 * in a search UI. With this widget, the user can filter the dataset based on facets.
 *
 * The refinement list displays only the most relevant facets for the current search
 * context. The sort option only affects the facet that are returned by the engine,
 * not which facets are returned.
 *
 * This widget also implements search for facet values, which is a mini search inside the
 * values of the facets. This makes easy to deal with uncommon facet values.
 *
 * @requirements
 *
 * The attribute passed to `attribute` must be declared as an
 * [attribute for faceting](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting)
 * in your Algolia settings.
 *
 * If you also want to use search for facet values on this attribute, you need to make it searchable using the [dashboard](https://www.algolia.com/explorer/display/) or using the [API](https://www.algolia.com/doc/guides/searching/faceting/#search-for-facet-values).
 */
const refinementList: RefinementListWidget = function refinementList(
  widgetParams
) {
  const {
    container,
    attribute,
    operator,
    sortBy,
    limit,
    showMore,
    showMoreLimit,
    searchable = false,
    searchablePlaceholder = 'Search...',
    searchableEscapeFacetValues = true,
    searchableIsAlwaysActive = true,
    cssClasses: userCssClasses = {},
    templates: userTemplates = defaultTemplates as RefinementListTemplates,
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
    label: cx(suit({ descendantName: 'label' }), userCssClasses.label),
    checkbox: cx(suit({ descendantName: 'checkbox' }), userCssClasses.checkbox),
    labelText: cx(
      suit({ descendantName: 'labelText' }),
      userCssClasses.labelText
    ),
    count: cx(suit({ descendantName: 'count' }), userCssClasses.count),
    noResults: cx(
      suit({ descendantName: 'noResults' }),
      userCssClasses.noResults
    ),
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
    templates: userTemplates,
    searchBoxTemplates: {
      submit: userTemplates.searchableSubmit,
      reset: userTemplates.searchableReset,
      loadingIndicator: userTemplates.searchableLoadingIndicator,
    },
    renderState: {},
    searchable,
    searchablePlaceholder,
    searchableIsAlwaysActive,
    showMore,
  });

  const makeWidget = connectRefinementList(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      attribute,
      operator,
      limit,
      showMore,
      showMoreLimit,
      sortBy,
      escapeFacetValues,
      transformItems,
    }),
    $$widgetType: 'ais.refinementList',
  };
};

export default refinementList;
