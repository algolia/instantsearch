/** @jsx h */

import {
  createAutocompleteComponent,
  createAutocompleteIndexComponent,
  createAutocompletePanelComponent,
  createAutocompletePropGetters,
  createAutocompleteSearchComponent,
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
  IndexUiState,
  IndexWidget,
  Renderer,
  RendererOptions,
  Template,
  WidgetFactory,
} from '../../types';
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

const usePropGetters = createAutocompletePropGetters({
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
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
} & Pick<AutocompleteWidgetParams<TItem>, 'getSearchPageURL' | 'onSelect'> &
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

      connectorParams.refine(targetIndex?.getHelper()?.state.query ?? '');
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
}: AutocompleteWrapperProps<TItem>) {
  const { isolatedIndex, targetIndex } = renderState;
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
  };
  const { getInputProps, getItemProps, getPanelProps, getRootProps } =
    usePropGetters({
      indices,
      indicesConfig,
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

  const query = isolatedIndex?.getHelper()?.state.query;

  return (
    <Autocomplete {...getRootProps()} classNames={cssClasses}>
      <AutocompleteSearchBox
        query={query || ''}
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
    getSearchPageURL,
    onSelect,
    templates = {},
    cssClasses: userCssClasses = {},
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
  } satisfies AutocompleteCSSClasses;

  const indicesConfig = [...indices];
  if (showSuggestions?.indexName) {
    indicesConfig.unshift({
      indexName: showSuggestions.indexName,
      templates: {
        // @ts-expect-error
        item: AutocompleteSuggestion,
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
      ...indicesConfig.map(({ indexName }) =>
        index({ indexName, indexId: indexName }).addWidgets([
          configure({ hitsPerPage: 5 }),
        ])
      ),
      {
        ...makeWidget({ escapeHTML }),
        $$widgetType: 'ais.autocomplete',
      },
    ]),
  ];
}
