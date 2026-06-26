import { createContext } from "preact";
import { useContext } from "preact/hooks";

import type { ChatLayout } from "../components/widgets/WidgetChat";

export const ChatLayoutContext = createContext<ChatLayout>("inline");

export function useChatLayout() {
  return useContext(ChatLayoutContext);
}
