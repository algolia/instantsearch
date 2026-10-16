import type { ChatRenderState } from '../../connectors/chat/connectChat';
import type { InstantSearch } from '../../types';

/**
 * Finds the render state of the `chat` widget an entry point should drive.
 *
 * Entry points (`compare`, …) share one chat per InstantSearch instance but can
 * be mounted in a different index than the chat, so the lookup is not limited
 * to the entry point's own index. When several chats are mounted, the order is
 * deterministic:
 *
 * 1. the chat in `indexId` (the entry point's own index),
 * 2. the chat in the main index,
 * 3. the first other chat, in the order the indices were rendered.
 */
export function getChatRenderState(
  instantSearchInstance: InstantSearch,
  indexId?: string
): ChatRenderState | undefined {
  const { renderState } = instantSearchInstance;

  const preferred = [indexId, instantSearchInstance.mainIndex?.getIndexId()];
  for (let i = 0; i < preferred.length; i++) {
    const id = preferred[i];
    const chat = id === undefined ? undefined : renderState[id]?.chat;
    if (chat) return chat;
  }

  const ids = Object.keys(renderState);
  for (let i = 0; i < ids.length; i++) {
    const chat = renderState[ids[i]]?.chat;
    if (chat) return chat;
  }

  return undefined;
}
