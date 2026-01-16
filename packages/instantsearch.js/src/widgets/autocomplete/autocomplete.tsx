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
  createChatMessagesComponent,
  cx,
  SparklesIcon,
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
  find,
  getContainerNode,
  walkIndex,
} from '../../lib/utils';
import { createDefaultTools } from '../chat/chat';
import { makeChatInstance } from '../chat/makeChat';
import configure from '../configure/configure';
import index from '../index/index';

import type {
  AutocompleteConnectorParams,
  AutocompleteRenderState,
  AutocompleteWidgetDescription,
} from '../../connectors/autocomplete/connectAutocomplete';
import type { ChatTransport } from '../../connectors/chat/connectChat';
import type { Chat, UIMessage } from '../../lib/chat';
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
  ChatStatus,
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

const AutocompleteSearchBox = createAutocompleteSearchComponent({
  createElement: h,
  Fragment,
});

const AutocompleteRecentSearch = createAutocompleteRecentSearchComponent({
  createElement: h,
  Fragment,
});

const ChatMessages = createChatMessagesComponent({
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
    templateProps:
      | PreparedTemplateProps<NonNullable<AutocompleteTemplates>>
      | undefined;
    RecentSearchComponent: typeof AutocompleteRecentSearch;
    recentSearchHeaderComponent:
      | typeof AutocompleteIndex['prototype']['props']['HeaderComponent']
      | undefined;
    chatInstance: Chat<UIMessage> | undefined;
  };
} & Pick<
  AutocompleteWidgetParams<TItem>,
  | 'getSearchPageURL'
  | 'onSelect'
  | 'agent'
  | 'display'
  | 'showSuggestions'
  | 'placeholder'
> & {
    showRecent:
      | Exclude<AutocompleteWidgetParams<TItem>['showRecent'], boolean>
      | undefined;
  } & Required<
    Pick<AutocompleteWidgetParams<TItem>, 'cssClasses' | 'templates'>
  >;

const createRenderer = <TItem extends BaseHit>(
  params: RendererParams<TItem>
): Renderer<
  AutocompleteRenderState,
  Partial<AutocompleteWidgetParams<TItem>>
> => {
  const { instanceId, containerNode, ...rendererParams } = params;
  return (connectorParams, isFirstRendering) => {
    if (isFirstRendering) {
      const showRecentObj = rendererParams.showRecent;
      let isolatedIndex = connectorParams.instantSearchInstance.mainIndex;
      let targetIndex = connectorParams.instantSearchInstance.mainIndex;
      walkIndex(targetIndex, (childIndex) => {
        if (childIndex.getIndexId() === `ais-autocomplete-${instanceId}`) {
          isolatedIndex = childIndex;
          targetIndex = childIndex.parent!;
        }
      });

      let RecentSearchComponent = ({
        item,
        onSelect,
        onApply,
        onRemoveRecentSearch,
      }: Parameters<typeof AutocompleteRecentSearch>[0]) => (
        <AutocompleteRecentSearch
          item={item}
          onSelect={onSelect}
          onApply={onApply}
          onRemoveRecentSearch={onRemoveRecentSearch}
        >
          {/* @ts-expect-error - it should accept string as return value */}
          <ConditionalReverseHighlight
            item={item as unknown as Hit<{ query: string }>}
          />
        </AutocompleteRecentSearch>
      );
      let recentSearchHeaderComponent: typeof AutocompleteIndex['prototype']['props']['HeaderComponent'] =
        undefined;

      if (showRecentObj && showRecentObj.templates) {
        const recentTemplateProps = prepareTemplateProps({
          defaultTemplates: {} as unknown as NonNullable<
            typeof showRecentObj.templates
          >,
          templatesConfig:
            connectorParams.instantSearchInstance.templatesConfig,
          templates: showRecentObj.templates,
        });

        if (showRecentObj.templates.item) {
          RecentSearchComponent = ({
            item,
            onSelect,
            onRemoveRecentSearch,
          }) => (
            <TemplateComponent
              {...recentTemplateProps}
              templateKey="item"
              rootTagName="fragment"
              data={{ item, onSelect, onRemoveRecentSearch }}
            />
          );
        }

        if (showRecentObj.templates.header) {
          recentSearchHeaderComponent = ({
            items,
          }: {
            items: Array<{ query: string }>;
          }) => (
            <TemplateComponent
              {...recentTemplateProps}
              templateKey="header"
              rootTagName="fragment"
              data={{ items }}
            />
          );
        }
      }
      rendererParams.renderState = {
        indexTemplateProps: [],
        isolatedIndex,
        targetIndex,
        templateProps: prepareTemplateProps({
          defaultTemplates: {} as unknown as NonNullable<
            typeof rendererParams.templates
          >,
          templatesConfig:
            connectorParams.instantSearchInstance.templatesConfig,
          templates: rendererParams.templates,
        }),
        RecentSearchComponent,
        recentSearchHeaderComponent,
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
  | 'agent'
  | 'display'
  | 'showRecent'
  | 'showSuggestions'
  | 'placeholder'
> &
  Pick<AutocompleteRenderState, 'indices' | 'refine'> &
  RendererOptions<Partial<AutocompleteWidgetParams<TItem>>>;

function AutocompleteWrapper<TItem extends BaseHit>({
  indicesConfig,
  indices,
  getSearchPageURL,
  onSelect: userOnSelect,
  refine: refineAutocomplete,
  cssClasses,
  renderState,
  instantSearchInstance,
  agent,
  display,
  showRecent,
  showSuggestions,
  templates,
  placeholder,
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
  const showRecentObj = showRecent;

  const recentSearchCssClasses = {
    root: cx('ais-AutocompleteRecentSearches', showRecentObj?.cssClasses?.root),
    list: cx(
      'ais-AutocompleteRecentSearchesList',
      showRecentObj?.cssClasses?.list
    ),
    header: cx(
      'ais-AutocompleteRecentSearchesHeader',
      showRecentObj?.cssClasses?.header
    ),
    item: cx(
      'ais-AutocompleteRecentSearchesItem',
      showRecentObj?.cssClasses?.item
    ),
  };

  const isSearchPage =
    targetIndex
      ?.getWidgets()
      .some(({ $$type }) =>
        ['ais.hits', 'ais.infiniteHits'].includes($$type)
      ) ?? false;

  const onRefine = (query: string) => {
    refineAutocomplete(query);
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

  const inputRef = useRef<HTMLInputElement>(null);

  const [showUi, setShowUi] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [agentMessages, setAgentMessages] = useState<any[]>([]);
  const [agentStatus, setAgentStatus] = useState<ChatStatus>('ready');
  const agentTools = createDefaultTools({
    item: (item, { html }) => {
      return html`<div>${JSON.stringify(item)}</div>`;
    },
  });
  const disableTools = indices.some(({ indexName }) => indexName === 'faq');

  const sendMessage = (message: string) => {
    if (agent && !renderState.chatInstance) {
      renderState.chatInstance = makeChatInstance(
        instantSearchInstance,
        agent,
        disableTools ? undefined : agentTools
      );
      renderState.chatInstance['~registerMessagesCallback'](() => {
        setAgentMessages(renderState.chatInstance!.messages);
      });
      renderState.chatInstance['~registerStatusCallback'](() => {
        setAgentStatus(renderState.chatInstance!.status);
      });
    }

    renderState.chatInstance!.sendMessage({ text: message });
  };

  useEffect(() => {
    document.body.classList.toggle('ais-AutocompleteDialog--active', showUi);
    if (showUi) {
      inputRef.current?.focus();
    }

    return () => {
      document.body.classList.remove('ais-AutocompleteDialog--active');
    };
  }, [showUi]);

  const indicesWithAgent = (
    _indices: Parameters<typeof usePropGetters>[0]['indices']
  ) => {
    if (!agent) {
      return _indices;
    }

    return [
      {
        indexName: 'ais-autocomplete-agent',
        indexId: 'ais-autocomplete-agent',
        hits: searchboxQuery ? [{ query: searchboxQuery }] : [],
      },
      ..._indices,
    ];
  };

  const indicesConfigWithAgent = (
    _indicesConfig: Array<AutocompleteIndexConfig<TItem>>
  ) => {
    if (!agent) {
      return _indicesConfig;
    }

    return [
      {
        indexName: 'ais-autocomplete-agent',
        getQuery: (item) => item.query,
        onSelect: ({ query }) => {
          sendMessage(query);
          inputRef.current!.select();
          setShowConversation(true);
        },
      },
      ..._indicesConfig,
    ];
  };

  const { getInputProps, getItemProps, getPanelProps, getRootProps } =
    usePropGetters({
      indices: indicesWithAgent(indicesForPropGetters),
      indicesConfig: indicesConfigWithAgent(indicesConfigForPropGetters),
      onRefine: (query) => {
        if (agent && showConversation) {
          sendMessage(query);
          inputRef.current!.select();
          return;
        }

        onRefine(query);
      },
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
      onApply: (query: string) => {
        refineAutocomplete(query);
      },
      placeholder: showConversation ? 'Ask another question…' : placeholder,
    });

  const elements: PanelElements = {};
  if (agent) {
    elements.agent = (
      <AutocompleteIndex
        // @ts-ignore - there seems to be problems with React.ComponentType and this, but it's actually correct
        ItemComponent={({ item, onSelect }) => {
          return (
            <div className="ais-Autocomplete-AgentPrompt" onClick={onSelect}>
              <div>
                <SparklesIcon createElement={h} />
              </div>
              {item.query && (
                <div>
                  Ask Agent: <span>{`"${item.query}"`}</span>
                </div>
              )}
              {!item.query && <div>Type something to ask a question…</div>}
            </div>
          );
        }}
        items={[
          {
            objectID: 'ais-autocomplete-agent',
            __indexName: 'ais-autocomplete-agent',
            query: searchboxQuery,
          },
        ]}
        getItemProps={getItemProps}
      />
    );
  }

  if (showRecent) {
    elements.recent = (
      <AutocompleteIndex
        HeaderComponent={renderState.recentSearchHeaderComponent}
        // @ts-ignore - there seems to be problems with React.ComponentType and this, but it's actually correct
        ItemComponent={({ item, onSelect, onApply }) => (
          <renderState.RecentSearchComponent
            item={item as unknown as { query: string }}
            onSelect={onSelect}
            onApply={onApply}
            onRemoveRecentSearch={() =>
              storage.onRemove((item as unknown as { query: string }).query)
            }
          />
        )}
        classNames={recentSearchCssClasses}
        items={storageHits}
        getItemProps={getItemProps}
      />
    );
  }

  indices.forEach(({ indexId, indexName, hits }, i) => {
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
      onApply,
    }: Parameters<AutocompleteIndexProps['ItemComponent']>[0]) => {
      return (
        <TemplateComponent
          {...renderState.indexTemplateProps[i]}
          templateKey="item"
          rootTagName="fragment"
          data={{ item, onSelect, onApply }}
        />
      );
    };

    const elementId =
      indexName === showSuggestions?.indexName ? 'suggestions' : indexName;

    const filteredHits =
      elementId === 'suggestions' && showRecent
        ? hits.filter(
            (suggestionHit) =>
              !find(
                storageHits,
                (storageHit) => storageHit.query === suggestionHit.query
              )
          )
        : hits;

    elements[elementId] = (
      <AutocompleteIndex
        key={indexId}
        HeaderComponent={headerComponent}
        ItemComponent={itemComponent}
        items={filteredHits.map((item) => ({
          ...item,
          __indexName: indexId,
        }))}
        getItemProps={getItemProps}
        classNames={indicesConfig[i].cssClasses}
      />
    );
  });

  const agentToolsWithLayoutComponent = Object.entries(agentTools).reduce(
    (acc, [key, tool]) => {
      return {
        ...acc,
        [key]: {
          ...tool,
          layoutComponent: (layoutComponentProps: any) => (
            <TemplateComponent
              templates={tool.templates}
              rootTagName="fragment"
              templateKey="layout"
              data={layoutComponentProps}
            />
          ),
        },
      };
    },
    {}
  );

  return (
    <AutocompleteDialogWrapper
      display={display}
      showUi={showUi}
      setShowUi={setShowUi}
      setShowConversation={setShowConversation}
      placeholder={placeholder}
    >
      <Autocomplete {...getRootProps()} classNames={cssClasses}>
        <AutocompleteSearchBox
          query={searchboxQuery || ''}
          inputProps={{
            ...getInputProps(),
            ref: inputRef,
            onInput: (event) =>
              refineAutocomplete(
                (event.currentTarget as HTMLInputElement).value
              ),
          }}
          onClear={() => {
            onRefine('');
          }}
          isSearchStalled={instantSearchInstance.status === 'stalled'}
        />
        {!showConversation ? (
          <AutocompletePanel
            {...(display === 'dialog'
              ? { ...getPanelProps(), hidden: false }
              : getPanelProps())}
          >
            {templates.panel ? (
              <TemplateComponent
                {...renderState.templateProps}
                templateKey="panel"
                rootTagName="fragment"
                data={{ elements, indices }}
              />
            ) : (
              Object.keys(elements).map((elementId) => elements[elementId])
            )}
          </AutocompletePanel>
        ) : (
          <div className="ais-AutocompletePanel ais-AutocompletePanel--open">
            <div className="ais-AutocompletePanelLayout">
              <ChatMessages
                messages={agentMessages}
                status={agentStatus}
                hideScrollToBottom={true}
                tools={disableTools ? undefined : agentToolsWithLayoutComponent}
                translations={{ loaderText: 'Thinking…' }}
              />
            </div>
          </div>
        )}
      </Autocomplete>
    </AutocompleteDialogWrapper>
  );
}

type AutocompleteDialogWrapperProps = {
  display?: 'inline' | 'dialog';
  showUi: boolean;
  setShowUi: (showUi: boolean) => void;
  setShowConversation: (showConversation: boolean) => void;
  placeholder?: string;
  children: any;
};

function AutocompleteDialogWrapper({
  display,
  showUi,
  setShowUi,
  setShowConversation,
  placeholder,
  children,
}: AutocompleteDialogWrapperProps) {
  if (display !== 'dialog') {
    return children;
  }

  return (
    <div className="ais-AutocompleteDialog">
      <button
        className="ais-AutocompleteDialog-Button"
        onClick={() => setShowUi(true)}
      >
        <div className="ais-AutocompleteDialog-Button-Icon">
          <svg width="10" height="10" viewBox="0 0 40 40" aria-hidden="true">
            <path d="M26.804 29.01c-2.832 2.34-6.465 3.746-10.426 3.746C7.333 32.756 0 25.424 0 16.378 0 7.333 7.333 0 16.378 0c9.046 0 16.378 7.333 16.378 16.378 0 3.96-1.406 7.594-3.746 10.426l10.534 10.534c.607.607.61 1.59-.004 2.202-.61.61-1.597.61-2.202.004L26.804 29.01zm-10.426.627c7.323 0 13.26-5.936 13.26-13.26 0-7.32-5.937-13.257-13.26-13.257C9.056 3.12 3.12 9.056 3.12 16.378c0 7.323 5.936 13.26 13.258 13.26z" />
          </svg>
        </div>
        <span>{placeholder}</span>
      </button>
      {showUi && (
        <div
          className="ais-AutocompleteDialog-Container"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowUi(false);
              setShowConversation(false);
            }
          }}
        >
          <div className="ais-AutocompleteDialog-Content">{children}</div>
        </div>
      )}
    </div>
  );
}

export type AutocompleteCSSClasses = Partial<AutocompleteClassNames>;

export type AutocompleteSearchParameters = Omit<PlainSearchParameters, 'index'>;

export type AutocompleteTemplates = {
  /**
   * Template to use for the panel.
   */
  panel?: Template<{
    elements: PanelElements;
    indices: AutocompleteRenderState['indices'];
  }>;
};

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

type PanelElements = Partial<
  // eslint-disable-next-line @typescript-eslint/ban-types
  Record<'agent' | 'recent' | 'suggestions' | (string & {}), preact.JSX.Element>
>;

type AutocompleteWidgetParams<TItem extends BaseHit> = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  agent?: ChatTransport;

  display?: 'inline' | 'dialog';

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
           * Template to use for the header, before the list of items.
           */
          header: Template<{ items: Array<{ query: string }> }>;
          /**
           * Template to use for each result. This template will receive an object containing a single record.
           */
          item: Template<{
            item: { query: string };
            onSelect: () => void;
            onRemoveRecentSearch: () => void;
          }>;
        }>;
        cssClasses?: Partial<AutocompleteIndexClassNames>;
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
  templates?: AutocompleteTemplates;

  /**
   * CSS classes to add.
   */
  cssClasses?: AutocompleteCSSClasses;

  /**
   * Placeholder text for the search input.
   */
  placeholder?: string;
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
    agent,
    display = 'inline',
    showRecent,
    searchParameters: userSearchParameters,
    getSearchPageURL,
    onSelect,
    templates = {},
    cssClasses: userCssClasses = {},
    placeholder,
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
          onApply,
        }: {
          item: { query: string };
          onSelect: () => void;
          onApply: () => void;
        }) => (
          <AutocompleteSuggestion
            item={item}
            onSelect={onSelectItem}
            onApply={onApply}
          >
            {/* @ts-expect-error - it should accept string as return value */}
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
  const shouldShowRecent = showRecent || undefined;
  const showRecentOptions =
    typeof shouldShowRecent === 'boolean' ? {} : shouldShowRecent;

  const specializedRenderer = createRenderer({
    instanceId,
    containerNode,
    indicesConfig,
    getSearchPageURL,
    onSelect,
    cssClasses,
    agent,
    display,
    showRecent: showRecentOptions,
    showSuggestions,
    placeholder,
    renderState: {
      indexTemplateProps: [],
      isolatedIndex: undefined,
      targetIndex: undefined,
      templateProps: undefined,
      RecentSearchComponent: AutocompleteRecentSearch,
      recentSearchHeaderComponent: undefined,
      chatInstance: undefined,
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
