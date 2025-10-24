/** @jsx h */

import {
  createAutocompleteComponent,
  createAutocompleteIndexComponent,
  createAutocompletePanelComponent,
  createAutocompletePropGetters,
  createAutocompleteSuggestionComponent,
  cx,
} from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';
import { useEffect, useId, useMemo, useRef, useState } from 'preact/hooks';

import SearchBox, {
  type SearchBoxComponentCSSClasses,
} from '../../components/SearchBox/SearchBox';
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
import searchBoxTemplates from '../search-box/defaultTemplates';

import type {
  AutocompleteConnectorParams,
  AutocompleteRenderState,
  AutocompleteWidgetDescription,
} from '../../connectors/autocomplete/connectAutocomplete';
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  BaseHit,
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
  cssClasses: AutocompleteCSSClasses;
  renderState: {
    indexTemplateProps: Array<
      PreparedTemplateProps<NonNullable<IndexConfig<TItem>['templates']>>
    >;
    isolatedIndex: IndexWidget | undefined;
    targetIndex: IndexWidget | undefined;
  };
  templates: AutocompleteTemplates<TItem>;
};

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
  'indicesConfig' | 'cssClasses' | 'templates' | 'renderState'
> &
  Pick<AutocompleteRenderState, 'indices' | 'refine'> &
  RendererOptions<Partial<AutocompleteWidgetParams<TItem>>>;

function AutocompleteWrapper<TItem extends BaseHit>({
  indicesConfig,
  indices,
  refine,
  cssClasses,
  renderState,
  instantSearchInstance,
}: AutocompleteWrapperProps<TItem>) {
  const { isolatedIndex, targetIndex } = renderState;
  const { getInputProps, getItemProps, getPanelProps, getRootProps } =
    usePropGetters({
      indices,
      indicesConfig,
      onRefine(query) {
        instantSearchInstance.setUiState((uiState) => ({
          ...uiState,
          [targetIndex!.getIndexId()]: {
            ...uiState[targetIndex!.getIndexId()],
            query,
          },
          [isolatedIndex!.getIndexId()]: { query },
        }));
      },
    });

  const query =
    instantSearchInstance.getUiState()[targetIndex!.getIndexId()].query;

  const searchBoxSuit = component('SearchBox');
  const searchBoxCssClasses = {
    root: cx(searchBoxSuit()),
    form: cx(searchBoxSuit({ descendantName: 'form' })),
    input: cx(searchBoxSuit({ descendantName: 'input' })),
    submit: cx(searchBoxSuit({ descendantName: 'submit' })),
    submitIcon: cx(searchBoxSuit({ descendantName: 'submitIcon' })),
    reset: cx(searchBoxSuit({ descendantName: 'reset' })),
    resetIcon: cx(searchBoxSuit({ descendantName: 'resetIcon' })),
    loadingIndicator: cx(searchBoxSuit({ descendantName: 'loadingIndicator' })),
    loadingIcon: cx(searchBoxSuit({ descendantName: 'loadingIcon' })),
  } satisfies SearchBoxComponentCSSClasses;

  return (
    <Autocomplete {...getRootProps()} classNames={cssClasses}>
      <SearchBox
        query={query}
        refine={refine}
        inputProps={getInputProps()}
        cssClasses={searchBoxCssClasses}
        templates={searchBoxTemplates}
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
      'indexName' | 'templates' | 'cssClasses'
    >
  >;

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
    const suggestionsSuit = component('AutocompleteSuggestions');
    indicesConfig.unshift({
      indexName: showSuggestions.indexName,
      templates: {
        // Temporarily force casting until the coming refactoring
        item: (showSuggestions.templates?.item ||
          AutocompleteSuggestion) as unknown as Template<{ item: TItem }>,
      },
      cssClasses: {
        root: cx(suggestionsSuit(), showSuggestions.cssClasses?.root),
        list: cx(
          suggestionsSuit({ descendantName: 'list' }),
          showSuggestions.cssClasses?.list
        ),
        item: cx(
          suggestionsSuit({ descendantName: 'item' }),
          showSuggestions.cssClasses?.item
        ),
      },
      getQuery: (item) => item.query,
      onSelect({ getQuery, setQuery }) {
        setQuery(getQuery());
      },
    });
  }

  const instanceId = ++autocompleteInstanceId;
  const specializedRenderer = createRenderer({
    instanceId,
    containerNode,
    indicesConfig,
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
        index({ indexName, indexId: indexName }).addWidgets([configure({})])
      ),
      {
        ...makeWidget({ escapeHTML }),
        $$widgetType: 'ais.autocomplete',
      },
    ]),
  ];
}
