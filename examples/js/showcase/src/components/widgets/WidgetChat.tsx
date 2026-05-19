import {
  chatInlineLayout,
  chatOverlayLayout,
  chatSidePanelLayout,
} from "instantsearch.js/es/templates";
import { chat } from "instantsearch.js/es/widgets";
import { Sparkles } from "lucide-preact";
import { useEffect, useRef } from "preact/hooks";

import { useSearch } from "../../context/search";
import { postToParent } from "../../utils/parentMessenger";

import { renderCarouselHit } from "./ProductCard";

import type { ChatRenderState } from "instantsearch.js/es/connectors/chat/connectChat";

export type ChatLayout = "inline" | "overlay" | "sidePanel";

const CHAT_AGENT_ID = "eedef238-5468-470d-bc37-f99fa741bd25";

// The chat's overlay/sidePanel layouts use `position: fixed`, which anchors to
// the iframe rather than the user's viewport when the showcase is embedded.
// We hide the floating trigger via CSS and render this inline one instead.
const IS_EMBEDDED =
  typeof window !== "undefined" && window.parent !== window;

type Props = {
  layout: ChatLayout;
  indexName: string;
};

export function WidgetChat({ layout, indexName }: Props) {
  const search = useSearch();
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const openChat = () => {
    const chatState = search.renderState[indexName]?.chat as
      | Partial<ChatRenderState>
      | undefined;
    chatState?.setOpen?.(true);
    // The opened panel anchors to the iframe edge; ask the docs to scroll us
    // into view so the panel doesn't appear far below the user's viewport.
    postToParent({ type: "showcase-scroll-into-view" });
  };

  useEffect(() => {
    const layouts = {
      inline: chatInlineLayout(),
      overlay: chatOverlayLayout(),
      sidePanel: chatSidePanelLayout(),
    };
    const widget = chat({
      container: containerRef.current!,
      agentId: CHAT_AGENT_ID,
      feedback: true,
      templates: {
        layout: (data) => layouts[layoutRef.current](data),
        item: (hit, helpers) => renderCarouselHit(hit, helpers),
      },
    });
    search.addWidgets([widget]);
    return () => {
      search.removeWidgets([widget]);
    };
  }, []);

  useEffect(() => {
    // Trigger a chat re-render so the reactive `layout` template picks up
    // the new value without destroying the widget (preserves messages, open,
    // maximized, and streaming state across layout changes).
    const chatState = search.renderState[indexName]?.chat as
      | Partial<ChatRenderState>
      | undefined;
    chatState?.setOpen?.(Boolean(chatState?.open));
  }, [layout, indexName, search]);

  return (
    <>
      {IS_EMBEDDED && layout !== "inline" && (
        <button
          type="button"
          onClick={openChat}
          class="chat-inline-trigger inline-flex cursor-pointer items-center gap-2 self-start px-3 py-1.5 text-sm font-medium"
        >
          <Sparkles size={14} />
          Open chat
        </button>
      )}
      <div ref={containerRef} />
    </>
  );
}
