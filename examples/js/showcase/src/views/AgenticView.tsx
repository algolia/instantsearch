import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { useRef, useEffect, useState } from 'preact/hooks';

import { ChatLayoutSwitcher } from '../components/ChatLayoutSwitcher';
import { WidgetAiAutocomplete } from '../components/widgets/WidgetAiAutocomplete';
import { WidgetChat, type ChatLayout } from '../components/widgets/WidgetChat';
import { WidgetChatTrigger } from '../components/widgets/WidgetChatTrigger';
import { WidgetHits } from '../components/widgets/WidgetHits';
import {
  WidgetPromptSuggestionsCustom,
  WidgetPromptSuggestionsPdp,
  WidgetPromptSuggestionsPlp,
} from '../components/widgets/WidgetPromptSuggestions';
import { WidgetResultCard } from '../components/widgets/WidgetResultCard';
import { WidgetSearchBox } from '../components/widgets/WidgetSearchBox';
import { WidgetSwitcher } from '../components/WidgetSwitcher';
import { ChatLayoutContext } from '../context/chatLayout';
import { SearchContext } from '../context/search';

import type { ChatRenderState } from 'instantsearch.js/es/connectors/chat/connectChat';

const algoliaClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const INDEX_NAME = 'instant_search';

// Stands in for the Agent Studio Rule that flags `resultCard` in
// `renderingContent`; remove once the backend returns it for this index.
const searchClient: typeof algoliaClient = {
  ...algoliaClient,
  search: ((requests, requestOptions) =>
    algoliaClient.search(requests, requestOptions).then((response) => {
      response.results.forEach((result) => {
        if ('hits' in result && result.index === INDEX_NAME) {
          // The client's `RenderingContent` type predates `widgets`.
          const renderingContent = result.renderingContent as
            | { widgets?: Record<string, unknown> }
            | undefined;
          result.renderingContent = {
            ...result.renderingContent,
            widgets: {
              ...renderingContent?.widgets,
              resultCard: { enabled: true },
            },
          } as typeof result.renderingContent;
        }
      });
      return response;
    })) as typeof algoliaClient.search,
};

export function AgenticView() {
  const searchRef = useRef<ReturnType<typeof instantsearch> | null>(null);
  if (searchRef.current === null) {
    searchRef.current = instantsearch({
      indexName: INDEX_NAME,
      searchClient,
    });
  }

  const [chatLayout, setChatLayout] = useState<ChatLayout>('inline');

  useEffect(() => {
    const search = searchRef.current!;
    search.start();
    return () => {
      // `ChatSidePanelLayout` mutates `document.body.style.marginRight` while
      // open and only restores it when `open` flips to `false`. Close the chat
      // before disposing so the restoration path runs and the margin doesn't
      // leak into other tabs.
      const chatState = search.renderState[INDEX_NAME]?.chat as
        | Partial<ChatRenderState>
        | undefined;
      chatState?.setOpen?.(false);
      search.dispose();
    };
  }, []);

  return (
    <SearchContext.Provider value={searchRef.current}>
      <ChatLayoutContext.Provider value={chatLayout}>
        <div class="flex flex-col gap-2">
          {/* Row 1: AI autocomplete | searchBox. The autocomplete only sets
              the page query on submit; searchBox does so as you type, which
              is how the resultCard below reacts while typing. */}
          <WidgetSwitcher
            destroy
            widgets={[
              {
                title: 'autocomplete (showPromptSuggestions + aiMode)',
                body: WidgetAiAutocomplete,
                docs: ['autocomplete'],
              },
              { title: 'searchBox', body: () => <WidgetSearchBox /> },
            ]}
          />

          {/* Row 2: PromptSuggestions */}
          <WidgetSwitcher
            title="promptSuggestions"
            destroy
            widgets={[
              {
                title: 'PLP',
                body: WidgetPromptSuggestionsPlp,
                docs: ['promptSuggestions'],
              },
              {
                title: 'PDP',
                body: WidgetPromptSuggestionsPdp,
                docs: ['promptSuggestions'],
              },
              {
                title: 'custom',
                body: WidgetPromptSuggestionsCustom,
                docs: ['promptSuggestions'],
              },
            ]}
          />

          {/* Row 3: ChatTrigger | Chat (hosts the layout switcher; the
              chat renders inline inside this tile, or floats/docks to the
              viewport for overlay/sidePanel).
              `min-w-0` lets the chat's grid-based carousel scroll horizontally
              inside its tile instead of forcing the flex row to overflow. */}
          <div class="flex flex-col gap-2 sm:flex-row">
            <WidgetSwitcher
              class="min-w-0 flex-1"
              widgets={[{ title: 'chatTrigger', body: WidgetChatTrigger }]}
            />
            <ChatLayoutSwitcher
              class="min-w-0 flex-1"
              layout={chatLayout}
              onLayoutChange={setChatLayout}
            >
              <WidgetChat layout={chatLayout} indexName={INDEX_NAME} />
            </ChatLayoutSwitcher>
          </div>

          {/* Row 4: ResultCard (the chat above is its "continue in chat"
              target: same index, same agentId) */}
          <WidgetSwitcher
            widgets={[{ title: 'resultCard', body: WidgetResultCard }]}
          />

          {/* Row 5: Hits */}
          <WidgetSwitcher widgets={[{ title: 'hits', body: WidgetHits }]} />
        </div>
      </ChatLayoutContext.Provider>
    </SearchContext.Provider>
  );
}
