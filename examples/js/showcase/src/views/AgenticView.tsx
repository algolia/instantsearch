import { liteClient as algoliasearch } from "algoliasearch/lite";
import instantsearch from "instantsearch.js";
import { useRef, useEffect, useState } from "preact/hooks";

import { ChatLayoutSwitcher } from "../components/ChatLayoutSwitcher";
import { WidgetAiAutocomplete } from "../components/widgets/WidgetAiAutocomplete";
import { WidgetChat, type ChatLayout } from "../components/widgets/WidgetChat";
// TODO: re-enable once the `filterSuggestions` widget works properly.
// import { WidgetFilterSuggestions } from "../components/widgets/WidgetFilterSuggestions";
import { WidgetHits } from "../components/widgets/WidgetHits";
import { WidgetSwitcher } from "../components/WidgetSwitcher";
import { SearchContext } from "../context/search";

import type { ChatRenderState } from "instantsearch.js/es/connectors/chat/connectChat";

const searchClient = algoliasearch("latency", "6be0576ff61c053d5f9a3225e2a90f76");

const INDEX_NAME = "instant_search";

export function AgenticView() {
  const searchRef = useRef<ReturnType<typeof instantsearch> | null>(null);
  if (searchRef.current === null) {
    searchRef.current = instantsearch({
      indexName: INDEX_NAME,
      searchClient,
    });
  }

  const [chatLayout, setChatLayout] = useState<ChatLayout>("inline");

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
      <div class="flex flex-col gap-2">
        {/* Row 1: AI autocomplete */}
        <WidgetSwitcher
          widgets={[
            { title: "autocomplete (showPromptSuggestions + aiMode)", body: WidgetAiAutocomplete, docs: ["autocomplete"] },
          ]}
        />

        {/* Row 2: Filter suggestions | Chat (hosts the layout switcher; the
            chat renders inline inside this tile, or floats/docks to the
            viewport for overlay/sidePanel).
            `min-w-0` lets the chat's grid-based carousel scroll horizontally
            inside its tile instead of forcing the flex row to overflow. */}
        <div class="flex flex-col gap-2 sm:flex-row">
          {/* <WidgetSwitcher
            class="min-w-0 flex-1"
            widgets={[{ title: "filterSuggestions", body: WidgetFilterSuggestions }]}
          /> */}
          <ChatLayoutSwitcher
            class="min-w-0 flex-1"
            layout={chatLayout}
            onLayoutChange={setChatLayout}
          >
            <WidgetChat layout={chatLayout} indexName={INDEX_NAME} />
          </ChatLayoutSwitcher>
        </div>

        {/* Row 3: Hits */}
        <WidgetSwitcher widgets={[{ title: "hits", body: WidgetHits }]} />
      </div>
    </SearchContext.Provider>
  );
}
