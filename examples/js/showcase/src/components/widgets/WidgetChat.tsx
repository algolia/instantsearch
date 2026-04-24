import {
  chatInlineLayout,
  chatOverlayLayout,
  chatSidePanelLayout,
} from "instantsearch.js/es/templates";
import { chat } from "instantsearch.js/es/widgets";
import { useEffect, useRef } from "preact/hooks";

import { useSearch } from "../../context/search";

import { renderCarouselHit } from "./ProductCard";

import type { ChatRenderState } from "instantsearch.js/es/connectors/chat/connectChat";

export type ChatLayout = "inline" | "overlay" | "sidePanel";

const CHAT_AGENT_ID = "eedef238-5468-470d-bc37-f99fa741bd25";

type Props = {
  layout: ChatLayout;
  indexName: string;
};

export function WidgetChat({ layout, indexName }: Props) {
  const search = useSearch();
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

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

  return <div ref={containerRef} />;
}
