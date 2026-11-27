/** @jsx h */

import { connectRefinementList } from 'instantsearch-core';
import {
  createDocumentationMessageGenerator,
  isEqual,
  suitComponent as component,
} from 'instantsearch-core/internal';
import { createRefinementListComponent, cx } from 'instantsearch-ui-components';
import { createRef, Fragment, h, render } from 'preact';

import SearchBox from '../../components/SearchBox/SearchBox';
import TemplateComponent from '../../components/Template/Template';
import { prepareTemplateProps } from '../../lib/templating';
import { getContainerNode, shouldRefineFromItemClick } from '../../lib/utils';
import searchBoxDefaultTemplates from '../search-box/defaultTemplates';

import defaultTemplates from './defaultTemplates';

import type {
  SearchBoxComponentCSSClasses,
  SearchBoxComponentTemplates,
} from '../../components/SearchBox/SearchBox';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { ComponentCSSClasses, Template } from '../../types';
import type { SearchBoxTemplates } from '../search-box/search-box';
import type {
  RefinementListRenderState,
  RefinementListConnectorParams,
  RefinementListWidgetDescription,
} from 'instantsearch-core';
import type { WidgetFactory, Renderer } from 'instantsearch-core';
import type { RefinementListItemComponentProps } from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'refinement-list',
});
const suit = component('RefinementList');
const searchBoxSuit = component('SearchBox');

export type RefinementListOwnCSSClasses = Partial<{
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
}>;

type RefinementListSearchableCSSClasses = Partial<{
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

export type RefinementListCSSClasses = RefinementListOwnCSSClasses &
  RefinementListSearchableCSSClasses;

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
  /**
   * Whether the `items` prop contains facet values from the global search or from the search inside the items.
   */
  isFromSearch: boolean;
};

export type RefinementListOwnTemplates = Partial<{
  /**
   * Item template, provided with `label`, `highlighted`, `value`, `count`, `isRefined`, `url` data properties.
   */
  item: Template<RefinementListItemData>;
  /**
   * Template used for the show more text, provided with `isShowingMore` data property.
   */
  showMoreText: Template<{ isShowingMore: boolean }>;
  /**
   * Templates to use for search for facet values when there are no results.
   */
  searchableNoResults: Template;
}>;

type RefinementListSearchableTemplates = Partial<{
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

export type RefinementListTemplates = RefinementListOwnTemplates &
  RefinementListSearchableTemplates;
export type RefinementListComponentTemplates =
  Required<RefinementListOwnTemplates>;

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
   * When activated, submitting the search box will select the first item in the list.
   * @default true
   */
  searchableSelectOnSubmit?: boolean;
  /**
   * Accessible name (aria-label) for the "Show more"/"Show less" toggle button.
   */
  showMoreButtonLabel?: string;
  /**
   * Templates to use for the widget.
   */
  templates?: RefinementListTemplates;
  /**
   * CSS classes to add to the wrapping elements.
   */
  cssClasses?: RefinementListCSSClasses;
};

type RefinementListComponentCSSClasses =
  ComponentCSSClasses<RefinementListOwnCSSClasses> & {
    searchable: SearchBoxComponentCSSClasses;
  };

const RefinementListUiComponent = createRefinementListComponent({
  createElement: h,
  Fragment,
});

type RefinementListRendererState = {
  templateProps?: PreparedTemplateProps<RefinementListOwnTemplates>;
  searchBoxTemplateProps?: PreparedTemplateProps<SearchBoxComponentTemplates>;
};

const renderer = ({
  containerNode,
  cssClasses,
  userCssClasses,
  templates,
  searchBoxTemplates,
  renderState,
  showMore,
  showMoreButtonLabel,
  searchable,
  searchablePlaceholder,
  searchableIsAlwaysActive,
  searchableSelectOnSubmit,
}: {
  containerNode: HTMLElement;
  cssClasses: RefinementListComponentCSSClasses;
  userCssClasses: RefinementListOwnCSSClasses;
  renderState: RefinementListRendererState;
  templates: RefinementListOwnTemplates;
  searchBoxTemplates: SearchBoxTemplates;
  showMore?: boolean;
  showMoreButtonLabel?: string;
  searchable?: boolean;
  searchablePlaceholder?: string;
  searchableIsAlwaysActive?: boolean;
  searchableSelectOnSubmit?: boolean;
}): Renderer<RefinementListRenderState, RefinementListConnectorParams> => {
  const searchBoxRef = createRef<SearchBox>();
  let lastRefinedValue: string | undefined = undefined;
  let lastRenderedState: Partial<RefinementListRenderState> = {};

  // Latest render values, read by the item component so that it keeps the
  // same identity across renders (a new one would remount every item).
  let current: Pick<
    RefinementListRenderState,
    'refine' | 'createURL' | 'isFromSearch' | 'searchForItems'
  >;

  const itemComponent = ({
    item,
    className,
    children,
  }: RefinementListItemComponentProps) => (
    <li
      className={className}
      onClick={(originalEvent) => {
        if (shouldRefineFromItemClick(originalEvent, item.isRefined)) {
          lastRefinedValue = item.value;
          current.refine(item.value);
        }
      }}
    >
      {templates.item !== undefined ? (
        <TemplateComponent
          {...renderState.templateProps!}
          templateKey="item"
          rootTagName="fragment"
          data={{
            ...item,
            url: current.createURL(item.value),
            cssClasses,
            isFromSearch: current.isFromSearch,
          }}
        />
      ) : (
        children
      )}
    </li>
  );

  return (
    {
      refine,
      items,
      createURL,
      searchForItems,
      isFromSearch,
      toggleShowMore,
      isShowingMore,
      hasExhaustiveItems,
      canToggleShowMore,
    },
    isFirstRendering
  ) => {
    if (isFirstRendering) {
      lastRenderedState = {};
      renderState.templateProps =
        prepareTemplateProps<RefinementListOwnTemplates>({
          defaultTemplates,
          templates,
        });
      renderState.searchBoxTemplateProps = prepareTemplateProps({
        defaultTemplates: searchBoxDefaultTemplates,
        templates: searchBoxTemplates,
      });
      return;
    }

    // Leaving search mode (e.g. after selecting an item) clears the query
    // typed in the search box.
    if (searchBoxRef.current && !isFromSearch) {
      searchBoxRef.current.resetInput();
    }

    // Updated before the skip below, so the handlers of a skipped render use
    // the latest callbacks.
    current = { refine, createURL, isFromSearch, searchForItems };

    // Skip renders that don't change the list, so they don't overwrite the
    // query typed in the search box with its default.
    if (
      isEqual(lastRenderedState.items, items) &&
      lastRenderedState.isShowingMore === isShowingMore &&
      lastRenderedState.canToggleShowMore === canToggleShowMore &&
      lastRenderedState.isFromSearch === isFromSearch &&
      lastRenderedState.hasExhaustiveItems === hasExhaustiveItems
    ) {
      return;
    }
    lastRenderedState = {
      items,
      isShowingMore,
      canToggleShowMore,
      isFromSearch,
      hasExhaustiveItems,
    };

    const shouldDisableSearchBox =
      searchableIsAlwaysActive !== true &&
      !(isFromSearch || !hasExhaustiveItems);

    render(
      <RefinementListUiComponent
        items={items}
        isFromSearch={isFromSearch}
        classNames={userCssClasses}
        itemComponent={itemComponent}
        searchBoxComponent={
          searchable
            ? () => (
                <SearchBox
                  ref={searchBoxRef}
                  placeholder={searchablePlaceholder}
                  disabled={shouldDisableSearchBox}
                  cssClasses={cssClasses.searchable}
                  templates={renderState.searchBoxTemplateProps!.templates}
                  onChange={(event: Event) =>
                    current.searchForItems(
                      (event.target as HTMLInputElement).value
                    )
                  }
                  onReset={() => current.searchForItems('')}
                  onSubmit={() => {
                    if (searchableSelectOnSubmit !== false && items[0]) {
                      current.refine(items[0].value);
                    }
                  }}
                  // This sets the search box to a controlled state because
                  // we don't rely on the `refine` prop but on `onChange`.
                  searchAsYouType={false}
                />
              )
            : undefined
        }
        showNoResults={Boolean(
          searchable && isFromSearch && items.length === 0
        )}
        noResultsComponent={() => (
          <TemplateComponent
            {...renderState.templateProps!}
            templateKey="searchableNoResults"
            rootTagName="fragment"
          />
        )}
        showMore={Boolean(showMore && !isFromSearch && items.length > 0)}
        canToggleShowMore={canToggleShowMore}
        isShowingMore={isShowingMore}
        onToggleShowMore={toggleShowMore}
        showMoreTextComponent={(data) => (
          <TemplateComponent
            {...renderState.templateProps!}
            templateKey="showMoreText"
            rootTagName="fragment"
            data={data}
          />
        )}
        translations={{ showMoreButtonLabel }}
      />,
      containerNode
    );

    // Preact doesn't keep the focus on the refined checkbox across renders.
    // @see https://github.com/preactjs/preact/issues/3242
    if (lastRefinedValue !== undefined) {
      const inputs = containerNode.querySelectorAll<HTMLInputElement>(
        '.ais-RefinementList-list input'
      );
      for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === lastRefinedValue) {
          inputs[i].focus();
          break;
        }
      }
      lastRefinedValue = undefined;
    }
  };
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
    showMoreButtonLabel,
    searchable = false,
    searchablePlaceholder = 'Search...',
    searchableIsAlwaysActive = true,
    searchableSelectOnSubmit = true,
    cssClasses: userCssClasses = {},
    templates = {},
    transformItems,
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

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
    templates,
    searchBoxTemplates: {
      submit: templates.searchableSubmit,
      reset: templates.searchableReset,
      loadingIndicator: templates.searchableLoadingIndicator,
    },
    renderState: {},
    userCssClasses,
    searchable,
    searchablePlaceholder,
    searchableIsAlwaysActive,
    searchableSelectOnSubmit,
    showMore,
    showMoreButtonLabel,
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
      transformItems,
    }),
    $$widgetType: 'ais.refinementList',
  };
};

export default refinementList;
