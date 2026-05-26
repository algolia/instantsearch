/**
 * Name of the `CustomEvent` dispatched on `window` when a standalone chat-page
 * suggestion pill is clicked. Listen on `window` to handle the click:
 *
 * ```ts
 * window.addEventListener(CHAT_PAGE_SUGGESTION_CLICK_EVENT, (event) => {
 *   myChat.send(event.detail.prompt);
 * });
 * ```
 */
export const CHAT_PAGE_SUGGESTION_CLICK_EVENT =
  'algolia:chat-page-suggestion-click';

export type ChatPageSuggestionClickDetail = {
  prompt: string;
  source?: string;
};

declare global {
  interface WindowEventMap {
    'algolia:chat-page-suggestion-click': CustomEvent<ChatPageSuggestionClickDetail>;
  }
}

export function dispatchSuggestionClick(prompt: string, source?: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(
    new CustomEvent<ChatPageSuggestionClickDetail>(
      CHAT_PAGE_SUGGESTION_CLICK_EVENT,
      {
        detail: { prompt, source },
        bubbles: true,
      }
    )
  );
}
