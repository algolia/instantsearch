import {
  createAutocompleteComponent,
  createAutocompleteIndexComponent,
  createAutocompletePanelComponent,
  createAutocompletePropGetters,
  createAutocompleteSuggestionComponent,
  createAutocompleteRecentSearchComponent,
  createAutocompleteStorage,
  cx,
  createChatMessagesComponent,
  SparklesIcon,
} from 'instantsearch-ui-components';
import { makeChatInstance } from 'instantsearch.js/es/widgets/chat/makeChat';
import React, {
  createElement,
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Configure,
  Index,
  useAutocomplete,
  useInstantSearch,
  useInstantSearchContext,
  useSearchBox,
} from 'react-instantsearch-core';

import { AutocompleteSearch } from '../components/AutocompleteSearch';

import { createDefaultTools } from './Chat';
import { ReverseHighlight } from './ReverseHighlight';

import type { PlainSearchParameters } from 'algoliasearch-helper';
import type {
  AutocompleteIndexClassNames,
  AutocompleteIndexConfig,
  Pragma,
  AutocompleteClassNames,
  AutocompleteIndexProps,
  ChatStatus,
} from 'instantsearch-ui-components';
import type { BaseHit, Hit, IndexUiState } from 'instantsearch.js';
import type { ChatTransport } from 'instantsearch.js/es/connectors/chat/connectChat';
import type { ComponentProps } from 'react';

const Autocomplete = createAutocompleteComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const AutocompletePanel = createAutocompletePanelComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const AutocompleteIndex = createAutocompleteIndexComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const AutocompleteSuggestion = createAutocompleteSuggestionComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const AutocompleteRecentSearch = createAutocompleteRecentSearchComponent({
  createElement: createElement as Pragma,
  Fragment,
});

const ChatMessages = createChatMessagesComponent({
  createElement: createElement as Pragma,
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
  useMemo,
  useState,
});

type AutocompleteSearchParameters = Omit<PlainSearchParameters, 'index'>;

type IndexConfig<TItem extends BaseHit> = AutocompleteIndexConfig<TItem> & {
  headerComponent?: AutocompleteIndexProps<TItem>['HeaderComponent'];
  itemComponent: AutocompleteIndexProps<TItem>['ItemComponent'];
  searchParameters?: AutocompleteSearchParameters;
  classNames?: Partial<AutocompleteIndexClassNames>;
};

type PanelElements = Partial<
  // eslint-disable-next-line @typescript-eslint/ban-types
  Record<'recent' | 'suggestions' | (string & {}), React.JSX.Element>
>;

export type AutocompleteProps<TItem extends BaseHit> = ComponentProps<'div'> & {
  indices?: Array<IndexConfig<TItem>>;

  agent?: ChatTransport;
  display?: 'inline' | 'dialog';

  showSuggestions?: Partial<
    Pick<
      IndexConfig<{ query: string }>,
      | 'indexName'
      | 'getURL'
      | 'headerComponent'
      | 'itemComponent'
      | 'classNames'
    >
  >;
  showRecent?:
    | boolean
    | {
        /**
         * Storage key to use in the local storage.
         */
        storageKey?: string;

        /**
         * Component to use for the header, before the list of items.
         */
        headerComponent?: AutocompleteIndexProps<{
          query: string;
        }>['HeaderComponent'];

        /**
         * Component to use for each recent search item.
         */
        itemComponent?: AutocompleteIndexProps<{
          query: string;
        }>['ItemComponent'] & {
          onRemoveRecentSearch: () => void;
        };

        classNames?: Partial<AutocompleteIndexClassNames>;
      };
  getSearchPageURL?: (nextUiState: IndexUiState) => string;
  onSelect?: AutocompleteIndexConfig<TItem>['onSelect'];
  panelComponent?: (props: {
    elements: PanelElements;
    indices: ReturnType<typeof useAutocomplete>['indices'];
  }) => React.JSX.Element;
  searchParameters?: AutocompleteSearchParameters;
  classNames?: Partial<AutocompleteClassNames>;
  placeholder?: string;
};

type InnerAutocompleteProps<TItem extends BaseHit> = Omit<
  AutocompleteProps<TItem>,
  'indices'
> & {
  indicesConfig: Array<IndexConfig<TItem>>;
  refineSearchBox: ReturnType<typeof useSearchBox>['refine'];
  indexUiState: IndexUiState;
  isSearchPage: boolean;
  recentSearchConfig?: {
    headerComponent?: AutocompleteIndexProps<{
      query: string;
    }>['HeaderComponent'];
    itemComponent: typeof AutocompleteRecentSearch;
    classNames: Partial<AutocompleteIndexClassNames>;
  };
};

export function EXPERIMENTAL_Autocomplete<TItem extends BaseHit = BaseHit>({
  indices = [],
  showSuggestions,
  showRecent,
  searchParameters: userSearchParameters,
  ...props
}: AutocompleteProps<TItem>) {
  const { indexUiState, indexRenderState } = useInstantSearch();
  const { refine } = useSearchBox(
    {},
    { $$type: 'ais.autocomplete', $$widgetType: 'ais.autocomplete' }
  );
  const searchParameters = {
    hitsPerPage: 5,
    ...userSearchParameters,
  };
  const indicesConfig = [...indices];
  if (showSuggestions?.indexName) {
    indicesConfig.unshift({
      indexName: showSuggestions.indexName,
      headerComponent:
        showSuggestions.headerComponent as unknown as AutocompleteIndexProps<TItem>['HeaderComponent'],
      itemComponent: (showSuggestions.itemComponent ||
        (({
          item,
          onSelect,
          onApply,
        }: Parameters<typeof AutocompleteSuggestion>[0]) => (
          <AutocompleteSuggestion
            item={item}
            onSelect={onSelect}
            onApply={onApply}
          >
            <ConditionalReverseHighlight
              item={item as unknown as Hit<{ query: string }>}
            />
          </AutocompleteSuggestion>
        ))) as unknown as AutocompleteIndexProps<TItem>['ItemComponent'],
      classNames: {
        root: cx(
          'ais-AutocompleteSuggestions',
          showSuggestions?.classNames?.root
        ),
        list: cx(
          'ais-AutocompleteSuggestionsList',
          showSuggestions?.classNames?.list
        ),
        header: cx(
          'ais-AutocompleteSuggestionsHeader',
          showSuggestions?.classNames?.header
        ),
        item: cx(
          'ais-AutocompleteSuggestionsItem',
          showSuggestions?.classNames?.item
        ),
      },
      getQuery: (item) => item.query,
      getURL: showSuggestions.getURL as unknown as IndexConfig<TItem>['getURL'],
    });
  }

  const recentSearchConfig = showRecent
    ? {
        headerComponent:
          typeof showRecent === 'object'
            ? showRecent.headerComponent
            : undefined,
        itemComponent:
          typeof showRecent === 'object' && showRecent.itemComponent
            ? showRecent.itemComponent
            : AutocompleteRecentSearch,
        classNames: {
          root: cx(
            'ais-AutocompleteRecentSearches',
            typeof showRecent === 'object'
              ? showRecent.classNames?.root
              : undefined
          ),
          list: cx(
            'ais-AutocompleteRecentSearchesList',
            typeof showRecent === 'object'
              ? showRecent.classNames?.list
              : undefined
          ),
          header: cx(
            'ais-AutocompleteRecentSearchesHeader',
            typeof showRecent === 'object'
              ? showRecent.classNames?.header
              : undefined
          ),
          item: cx(
            'ais-AutocompleteRecentSearchesItem',
            typeof showRecent === 'object'
              ? showRecent.classNames?.item
              : undefined
          ),
        },
      }
    : undefined;

  const isSearchPage = useMemo(
    () =>
      typeof indexRenderState.hits !== 'undefined' ||
      typeof indexRenderState.infiniteHits !== 'undefined',
    [indexRenderState]
  );

  return (
    <Fragment>
      <Index EXPERIMENTAL_isolated>
        <Configure {...searchParameters} />
        {indicesConfig.map((index) => (
          <Index key={index.indexName} indexName={index.indexName}>
            <Configure {...index.searchParameters} />
          </Index>
        ))}
        <InnerAutocomplete
          {...props}
          indicesConfig={indicesConfig}
          refineSearchBox={refine}
          indexUiState={indexUiState}
          isSearchPage={isSearchPage}
          showRecent={showRecent}
          recentSearchConfig={recentSearchConfig}
          showSuggestions={showSuggestions}
        />
      </Index>
    </Fragment>
  );
}

function InnerAutocomplete<TItem extends BaseHit = BaseHit>({
  indicesConfig,
  refineSearchBox,
  getSearchPageURL,
  onSelect: userOnSelect,
  indexUiState,
  isSearchPage,
  panelComponent: PanelComponent,
  agent,
  display,
  showRecent,
  recentSearchConfig,
  showSuggestions,
  placeholder,
  ...props
}: InnerAutocompleteProps<TItem>) {
  const instantSearchInstance = useInstantSearchContext();
  const {
    indices,
    refine: refineAutocomplete,
    currentRefinement,
  } = useAutocomplete();

  const {
    storage,
    storageHits,
    indicesForPropGetters,
    indicesConfigForPropGetters,
  } = useStorage<TItem>({
    showRecent,
    query: currentRefinement,
    indices,
    indicesConfig,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [showUi, setShowUi] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [agentMessages, setAgentMessages] = useState<any[]>([]);
  const [agentStatus, setAgentStatus] = useState<ChatStatus>('ready');

  // @ts-ignore
  const agentTools = createDefaultTools(({ item }) => <div>{item.name}</div>);
  const chatInstance = useMemo(() => {
    if (!agent) {
      return undefined;
    }

    const instance = makeChatInstance(instantSearchInstance, agent, agentTools);
    instance['~registerMessagesCallback'](() =>
      setAgentMessages(instance.messages)
    );
    instance['~registerStatusCallback'](() => setAgentStatus(instance.status));

    return instance;
  }, [agent, instantSearchInstance, agentTools]);

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
        hits: currentRefinement ? [{ query: currentRefinement }] : [],
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
        // @ts-ignore
        getQuery: (item) => item.query,
        // @ts-ignore
        onSelect: ({ query }) => {
          chatInstance!.sendMessage({ text: query });
          inputRef.current!.select();
          setShowConversation(true);
        },
      },
      ..._indicesConfig,
    ];
  };

  const { getInputProps, getItemProps, getPanelProps, getRootProps } =
    usePropGetters<TItem>({
      indices: indicesWithAgent(indicesForPropGetters),
      indicesConfig: indicesConfigWithAgent(indicesConfigForPropGetters),
      onRefine: (query) => {
        if (agent && showConversation) {
          chatInstance!.sendMessage({ text: query });
          inputRef.current!.select();
          return;
        }

        refineAutocomplete(query);
        refineSearchBox(query);
        storage.onAdd(query);
      },
      onApply: (query) => {
        refineAutocomplete(query);
      },
      onSelect:
        userOnSelect ??
        (({ query, setQuery, url }) => {
          if (url) {
            window.location.href = url;
            return;
          }

          if (!isSearchPage && typeof getSearchPageURL !== 'undefined') {
            window.location.href = getSearchPageURL({ ...indexUiState, query });
            return;
          }

          setQuery(query);
        }),
      placeholder: showConversation ? 'Ask another question…' : placeholder,
    });

  const elements: PanelElements = {};
  if (agent) {
    elements.agent = (
      <AutocompleteIndex
        ItemComponent={({ item, onSelect }) => (
          <div className="ais-Autocomplete-AgentPrompt" onClick={onSelect}>
            <div>
              {/* @ts-ignore */}
              <SparklesIcon createElement={createElement} />
            </div>
            {item.query ? (
              <div>
                Ask Agent: <span>{`"${item.query}"`}</span>
              </div>
            ) : (
              <div>Type something to ask a question…</div>
            )}
          </div>
        )}
        items={[
          {
            objectID: 'ais-autocomplete-agent',
            __indexName: 'ais-autocomplete-agent',
            query: currentRefinement,
          },
        ]}
        getItemProps={getItemProps}
        key="ais-autocomplete-agent"
      />
    );
  }

  if (showRecent && recentSearchConfig) {
    const RecentSearchItemComponent = recentSearchConfig.itemComponent;
    elements.recent = (
      <AutocompleteIndex
        HeaderComponent={
          recentSearchConfig.headerComponent as AutocompleteIndexProps['HeaderComponent']
        }
        // @ts-ignore - there seems to be problems with React.ComponentType and this, but it's actually correct
        ItemComponent={({ item, onSelect, onApply }) => (
          <RecentSearchItemComponent
            item={item as unknown as { query: string }}
            onSelect={onSelect}
            onRemoveRecentSearch={() =>
              storage.onRemove((item as unknown as { query: string }).query)
            }
            onApply={onApply}
          >
            <ConditionalReverseHighlight
              item={item as unknown as Hit<{ query: string }>}
            />
          </RecentSearchItemComponent>
        )}
        classNames={recentSearchConfig.classNames}
        items={storageHits}
        getItemProps={getItemProps}
        key="recentSearches"
      />
    );
  }

  indices.forEach(({ indexId, indexName, hits }, i) => {
    const elementId =
      indexName === showSuggestions?.indexName ? 'suggestions' : indexName;
    const filteredHits =
      elementId === 'suggestions' && showRecent
        ? hits.filter(
            (suggestionHit) =>
              !storageHits.find(
                (storageHit) => storageHit.query === suggestionHit.query
              )
          )
        : hits;
    elements[elementId] = (
      <AutocompleteIndex
        key={indexId}
        // @ts-expect-error - there seems to be problems with React.ComponentType and this, but it's actually correct
        HeaderComponent={indicesConfig[i].headerComponent}
        // @ts-expect-error - there seems to be problems with React.ComponentType and this, but it's actually correct
        ItemComponent={indicesConfig[i].itemComponent}
        items={filteredHits.map((item) => ({
          ...item,
          __indexName: indexId,
        }))}
        getItemProps={getItemProps}
        classNames={indicesConfig[i].classNames}
      />
    );
  });

  return (
    <AutocompleteDialogWrapper
      display={display}
      showUi={showUi}
      setShowUi={setShowUi}
      setShowConversation={setShowConversation}
      placeholder={placeholder}
    >
      <Autocomplete {...props} {...getRootProps()}>
        <AutocompleteSearch
          // @ts-ignore
          inputProps={{ ...getInputProps(), ref: inputRef }}
          clearQuery={() => {
            refineSearchBox('');
            refineAutocomplete('');
          }}
        />
        {!showConversation ? (
          <AutocompletePanel {...getPanelProps()}>
            {PanelComponent ? (
              <PanelComponent elements={elements} indices={indices} />
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
                // @ts-ignore
                tools={agentTools}
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
