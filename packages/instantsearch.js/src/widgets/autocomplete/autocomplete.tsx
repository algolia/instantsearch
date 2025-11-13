/** @jsx h */

import {
  createAutocompleteComponent,
  createAutocompleteIndexComponent,
  createAutocompletePanelComponent,
  createAutocompletePropGetters,
  createAutocompleteRecentSearchComponent,
  createAutocompleteSearchComponent,
  createAutocompleteStorage,
  createAutocompleteSuggestionComponent,
  cx,
} from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';
import { useEffect, useId, useMemo, useRef, useState } from 'preact/hooks';

import TemplateComponent from '../../components/Template/Template';
import {
  connectAutocomplete,
  connectSearchBox,
} from '../../connectors/index.umd';
import { ReverseHighlight } from '../../helpers/components';
import { component } from '../../lib/suit';
import { prepareTemplateProps } from '../../lib/templating';
import {
  createDocumentationMessageGenerator,
  getContainerNode,
  walkIndex,
} from '../../lib/utils';
import configure from '../configure/configure';
import index from '../index/index';

import type {
  AutocompleteConnectorParams,
  AutocompleteRenderState,
  AutocompleteWidgetDescription,
} from '../../connectors/autocomplete/connectAutocomplete';
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  BaseHit,
  Hit,
  IndexUiState,
  IndexWidget,
  Renderer,
  RendererOptions,
  Template,
  WidgetFactory,
} from '../../types';
import type { PlainSearchParameters } from 'algoliasearch-helper';
import type {
  AutocompleteClassNames,
  AutocompleteIndexClassNames,
  AutocompleteIndexConfig,
  AutocompleteIndexProps,
} from 'instantsearch-ui-components';
import type { JSX as JSXPreact } from 'preact';

let autocompleteInstanceId = 0;
const withUsage = createDocumentationMessageGenerator({ name: 'autocomplete' });
const suit = component('Autocomplete');

const Autocomplete = createAutocompleteComponent({
  createElement: h,
  Fragment,
});

const AutocompletePanel = createAutocompletePanelComponent({
  createElement: h,
  Fragment,
});

const AutocompleteIndex = createAutocompleteIndexComponent({
  createElement: h,
  Fragment,
});

const AutocompleteSuggestion = createAutocompleteSuggestionComponent({
  createElement: h,
  Fragment,
});

const AutocompleteSearchBox = createAutocompleteSearchComponent({
  createElement: h,
  Fragment,
});

const AutocompleteRecentSearch = createAutocompleteRecentSearchComponent({
  createElement: h,
  Fragment,
});

const usePropGetters = createAutocompletePropGetters({
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
});

const useStorage = createAutocompleteStorage({
  useEffect,
  useState,
  useMemo,
});

type RendererParams<TItem extends BaseHit> = {
  instanceId: number;
  containerNode: HTMLElement;
  indicesConfig: Array<IndexConfig<TItem>>;
  renderState: {
    indexTemplateProps: Array<
      PreparedTemplateProps<NonNullable<IndexConfig<TItem>['templates']>>
    >;
    isolatedIndex: IndexWidget | undefined;
    targetIndex: IndexWidget | undefined;
  };
} & Pick<
  AutocompleteWidgetParams<TItem>,
  'getSearchPageURL' | 'onSelect' | 'showRecent'
> &
  Required<Pick<AutocompleteWidgetParams<TItem>, 'cssClasses' | 'templates'>>;

const createRenderer = <TItem extends BaseHit>(
  params: RendererParams<TItem>
): Renderer<
  AutocompleteRenderState,
  Partial<AutocompleteWidgetParams<TItem>>
> => {
  const { instanceId, containerNode, ...rendererParams } = params;
  return (connectorParams, isFirstRendering) => {
    if (isFirstRendering) {
      let isolatedIndex = connectorParams.instantSearchInstance.mainIndex;
      let targetIndex = connectorParams.instantSearchInstance.mainIndex;
      walkIndex(targetIndex, (childIndex) => {
        if (childIndex.getIndexId() === `ais-autocomplete-${instanceId}`) {
          isolatedIndex = childIndex;
          targetIndex = childIndex.parent!;
        }
      });

      rendererParams.renderState = {
        indexTemplateProps: [],
        isolatedIndex,
        targetIndex,
      };

      connectorParams.refine(targetIndex.getHelper()?.state.query ?? '');
      return;
    }

    render(
      <AutocompleteWrapper<TItem> {...rendererParams} {...connectorParams} />,
      containerNode
    );
  };
};

type AutocompleteWrapperProps<TItem extends BaseHit> = Pick<
  RendererParams<TItem>,
  | 'indicesConfig'
  | 'getSearchPageURL'
  | 'onSelect'
  | 'cssClasses'
  | 'templates'
  | 'renderState'
  | 'showRecent'
> &
  Pick<AutocompleteRenderState, 'indices' | 'refine'> &
  RendererOptions<Partial<AutocompleteWidgetParams<TItem>>>;

function AutocompleteWrapper<TItem extends BaseHit>({
  indicesConfig,
  indices,
  getSearchPageURL,
  onSelect: userOnSelect,
  refine,
  cssClasses,
  renderState,
  instantSearchInstance,
  showRecent,
}: AutocompleteWrapperProps<TItem>) {
  const { isolatedIndex, targetIndex } = renderState;

  const searchboxQuery = isolatedIndex?.getHelper()?.state.query;

  const {
    storage,
    storageHits,
    indicesConfigForPropGetters,
    indicesForPropGetters,
  } = useStorage<TItem>({
    query: searchboxQuery,
    showRecent,
    indices,
    indicesConfig,
  });

  const isSearchPage =
    targetIndex
      ?.getWidgets()
      .some(({ $$type }) =>
        ['ais.hits', 'ais.infiniteHits'].includes($$type)
      ) ?? false;

  const onRefine = (query: string) => {
    instantSearchInstance.setUiState((uiState) => ({
      ...uiState,
      [targetIndex!.getIndexId()]: {
        ...uiState[targetIndex!.getIndexId()],
        query,
      },
      [isolatedIndex!.getIndexId()]: { query },
    }));
    query.length > 0 && storage.onAdd(query);
  };

  const { getInputProps, getItemProps, getPanelProps, getRootProps } =
    usePropGetters({
      indices: indicesForPropGetters,
      indicesConfig: indicesConfigForPropGetters,
      onRefine,
      onSelect:
        userOnSelect ??
        (({ query, setQuery, url }) => {
          if (url) {
            window.location.href = url;
            return;
          }

          if (!isSearchPage && typeof getSearchPageURL !== 'undefined') {
            const indexUiState =
              instantSearchInstance.getUiState()[targetIndex!.getIndexId()];
            window.location.href = getSearchPageURL({ ...indexUiState, query });
            return;
          }

          setQuery(query);
        }),
    });

  let AutocompleteRecentSearchComponent = ({
    item,
    onSelect,
    onRemoveRecentSearch,
  }: Parameters<typeof AutocompleteRecentSearch>[0]) => (
    <AutocompleteRecentSearch
      item={item}
      onSelect={onSelect}
      onRemoveRecentSearch={onRemoveRecentSearch}
    >
      <ConditionalReverseHighlight
        item={item as unknown as Hit<{ query: string }>}
      />
    </AutocompleteRecentSearch>
  );
  if (typeof showRecent === 'object' && showRecent.templates?.item) {
    const props = prepareTemplateProps({
      defaultTemplates: {} as unknown as NonNullable<
        typeof showRecent.templates
      >,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates: showRecent.templates,
    });
    AutocompleteRecentSearchComponent = ({
      item,
      onSelect,
      onRemoveRecentSearch,
    }) => (
      <TemplateComponent
        {...props}
        templateKey="item"
        rootTagName="fragment"
        data={{ item, onSelect, onRemoveRecentSearch }}
      />
    );
  }

  return (
    <Autocomplete {...getRootProps()} classNames={cssClasses}>
      <AutocompleteSearchBox
        query={searchboxQuery || ''}
        inputProps={{
          ...getInputProps(),
          // @ts-ignore - This clashes with some ambient React JSX declarations.
          onInput: (evt: JSXPreact.TargetedEvent<HTMLInputElement>) =>
            refine(evt.currentTarget.value),
        }}
        onClear={() => onRefine('')}
        isSearchStalled={instantSearchInstance.status === 'stalled'}
      />
      <AutocompletePanel {...getPanelProps()}>
        {showRecent && (
          <AutocompleteIndex
            // @ts-ignore - there seems to be problems with React.ComponentType and this, but it's actually correct
            ItemComponent={({ item, onSelect }) => (
              <AutocompleteRecentSearchComponent
                item={item as unknown as { query: string }}
                onSelect={onSelect}
                onRemoveRecentSearch={() =>
                  storage.onRemove((item as unknown as { query: string }).query)
                }
              />
            )}
            classNames={{
              root: 'ais-AutocompleteRecentSearches',
              list: 'ais-AutocompleteRecentSearchesList',
              item: 'ais-AutocompleteRecentSearchesItem',
            }}
            items={storageHits}
            getItemProps={getItemProps}
          />
        )}
        {indices.map(({ indexId, hits }, i) => {
          if (!renderState.indexTemplateProps[i]) {
            renderState.indexTemplateProps[i] = prepareTemplateProps({
              defaultTemplates: {} as unknown as NonNullable<
                IndexConfig<TItem>['templates']
              >,
              templatesConfig: instantSearchInstance.templatesConfig,
              templates: indicesConfig[i].templates,
            });
          }
          const headerComponent = indicesConfig[i].templates?.header
            ? ({
                items,
              }: Parameters<
                NonNullable<AutocompleteIndexProps['HeaderComponent']>
              >[0]) => {
                return (
                  <TemplateComponent
                    {...renderState.indexTemplateProps[i]}
                    templateKey="header"
                    rootTagName="fragment"
                    data={{ items }}
                  />
                );
              }
            : undefined;
          const itemComponent = ({
            item,
            onSelect,
          }: Parameters<AutocompleteIndexProps['ItemComponent']>[0]) => {
            return (
              <TemplateComponent
                {...renderState.indexTemplateProps[i]}
                templateKey="item"
                rootTagName="fragment"
                data={{ item, onSelect }}
              />
            );
          };

          return (
            <AutocompleteIndex
              key={indexId}
              HeaderComponent={headerComponent}
              ItemComponent={itemComponent}
              items={hits.map((item) => ({ ...item, __indexName: indexId }))}
              getItemProps={getItemProps}
              classNames={indicesConfig[i].cssClasses}
            />
          );
        })}
      </AutocompletePanel>
    </Autocomplete>
  );
}

export type AutocompleteCSSClasses = Partial<AutocompleteClassNames>;

export type AutocompleteSearchParameters = Omit<PlainSearchParameters, 'index'>;

export type AutocompleteTemplates<TItem extends BaseHit> = Partial<
  Record<string, TItem>
>;

type IndexConfig<TItem extends BaseHit> = AutocompleteIndexConfig<TItem> & {
  templates?: Partial<{
    /**
     * Template to use for the header, before the list of items.
     */
    header: Template<{ items: TItem[] }>;
    /**
     * Template to use for each result. This template will receive an object containing a single record.
     */
    item: Template<{ item: TItem; onSelect: () => void }>;
  }>;

  /**
   * Search parameters to apply to this index.
   */
  searchParameters?: AutocompleteSearchParameters;

  cssClasses?: Partial<AutocompleteIndexClassNames>;
};

type AutocompleteWidgetParams<TItem extends BaseHit> = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Indices to use in the Autocomplete.
   */
  indices?: Array<IndexConfig<TItem>>;

  /**
   * Index to use for retrieving and showing query suggestions.
   */
  showSuggestions?: Partial<
    Pick<
      IndexConfig<{ query: string }>,
      'indexName' | 'getURL' | 'templates' | 'cssClasses'
    >
  >;

  showRecent?:
    | boolean
    | {
        /**
         * Storage key to use in the local storage.
         */
        storageKey?: string;
        templates?: Partial<{
          /**
           * Template to use for each result. This template will receive an object containing a single record.
           */
          item: Template<{
            item: { query: string };
            onSelect: () => void;
            onRemoveRecentSearch: () => void;
          }>;
        }>;
      };

  /**
   * Search parameters to apply to the autocomplete indices.
   */
  searchParameters?: AutocompleteSearchParameters;

  getSearchPageURL?: (nextUiState: IndexUiState) => string;

  onSelect?: AutocompleteIndexConfig<TItem>['onSelect'];

  /**
   * Templates to use for the widget.
   */
  templates?: AutocompleteTemplates<TItem>;

  /**
   * CSS classes to add.
   */
  cssClasses?: AutocompleteCSSClasses;
};

export type AutocompleteWidget<TItem extends BaseHit = BaseHit> = WidgetFactory<
  AutocompleteWidgetDescription & { $$widgetType: 'ais.autocomplete' },
  AutocompleteConnectorParams,
  AutocompleteWidgetParams<TItem>
>;

export function EXPERIMENTAL_autocomplete<TItem extends BaseHit = BaseHit>(
  widgetParams: AutocompleteWidgetParams<TItem> & AutocompleteConnectorParams
) {
  const {
    container,
    escapeHTML,
    indices = [],
    showSuggestions,
    showRecent,
    searchParameters: userSearchParameters,
    getSearchPageURL,
    onSelect,
    templates = {},
    cssClasses: userCssClasses = {},
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const searchParameters = {
    hitsPerPage: 5,
    ...userSearchParameters,
  };

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
  } satisfies AutocompleteCSSClasses;

  const indicesConfig = [...indices];
  if (showSuggestions?.indexName) {
    indicesConfig.unshift({
      indexName: showSuggestions.indexName,
      templates: {
        // @ts-expect-error
        item: ({
          item,
          onSelect: onSelectItem,
        }: {
          item: { query: string };
          onSelect: () => void;
        }) => (
          <AutocompleteSuggestion item={item} onSelect={onSelectItem}>
            <ConditionalReverseHighlight
              item={item as unknown as Hit<{ query: string }>}
            />
          </AutocompleteSuggestion>
        ),
        ...showSuggestions.templates,
      },
      cssClasses: {
        root: cx(
          'ais-AutocompleteSuggestions',
          showSuggestions.cssClasses?.root
        ),
        list: cx(
          'ais-AutocompleteSuggestionsList',
          showSuggestions.cssClasses?.list
        ),
        header: cx(
          'ais-AutocompleteSuggestionsHeader',
          showSuggestions.cssClasses?.header
        ),
        item: cx(
          'ais-AutocompleteSuggestionsItem',
          showSuggestions.cssClasses?.item
        ),
      },
      getQuery: (item) => item.query,
      getURL: showSuggestions.getURL as unknown as IndexConfig<TItem>['getURL'],
    });
  }

  const instanceId = ++autocompleteInstanceId;
  const specializedRenderer = createRenderer({
    instanceId,
    containerNode,
    indicesConfig,
    getSearchPageURL,
    onSelect,
    cssClasses,
    showRecent,
    renderState: {
      indexTemplateProps: [],
      isolatedIndex: undefined,
      targetIndex: undefined,
    },
    templates,
  });

  const makeWidget = connectAutocomplete(specializedRenderer, () =>
    render(null, containerNode)
  );

  return [
    connectSearchBox(() => null)({}),
    index({
      indexId: `ais-autocomplete-${instanceId}`,
      EXPERIMENTAL_isolated: true,
    }).addWidgets([
      configure(searchParameters),
      ...indicesConfig.map(
        ({ indexName, searchParameters: indexSearchParameters }) =>
          index({ indexName, indexId: indexName }).addWidgets([
            configure(indexSearchParameters || {}),
          ])
      ),
      {
        ...makeWidget({ escapeHTML }),
        $$widgetType: 'ais.autocomplete',
      },
    ]),
  ];
}

function ConditionalReverseHighlight<TItem extends { query: string }>({
  item,
}: {
  item: Hit<TItem>;
}) {
  if (
    !item._highlightResult?.query ||
    // @ts-expect-error - we should not have matchLevel as arrays here
    item._highlightResult.query.matchLevel === 'none'
  ) {
    return item.query;
  }

  return <ReverseHighlight attribute="query" hit={item} />;
}
