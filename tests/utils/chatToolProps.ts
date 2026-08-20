import { isStatusBusy } from 'instantsearch-ui-components';

import type { ClientSideToolComponentProps } from 'instantsearch-ui-components';

/**
 * Chat tool layout components receive the shared `context` *and* the deprecated
 * root-level props the widget still passes for back compat. Fixtures only build
 * the context, so this mirrors it into both shapes.
 *
 * Delete alongside the deprecated root props in the next major.
 */
type ToolContext = ClientSideToolComponentProps['context'];

// The turn state a widget would derive for the fixture, so a fixture can't
// declare a `status` and an `isBusy` that contradict each other.
type DerivedKeys =
  | 'hasActiveReasoning'
  | 'isBusy'
  | 'lastMessage'
  | 'parentMessage'
  | 'phase'
  | 'showLoader';

export function chatToolProps(
  context: Omit<ToolContext, DerivedKeys> &
    Partial<Pick<ToolContext, DerivedKeys>>
): ClientSideToolComponentProps {
  // Fixtures that don't care which message owns the tool call get the one from
  // the conversation, or a minimal stand-in wrapping the part.
  const parentMessage = context.parentMessage ||
    context.messages.find((message) =>
      message.parts.includes(context.message)
    ) || {
      id: 'parent',
      role: 'assistant' as const,
      parts: [context.message],
    };

  const isBusy = context.isBusy ?? isStatusBusy(context.status);

  return {
    context: {
      phase: isBusy ? 'ran-tool' : 'idle',
      hasActiveReasoning: false,
      showLoader: false,
      ...context,
      isBusy,
      lastMessage:
        context.lastMessage ?? context.messages[context.messages.length - 1],
      parentMessage,
    },
    message: context.message,
    messages: context.messages,
    records: context.records,
    insightsEventContext: context.insightsEventContext,
    status: context.status,
    indexUiState: context.indexUiState,
    setIndexUiState: context.setIndexUiState,
    onClose: context.onClose,
    addToolResult: context.addToolResult,
    applyFilters: context.applyFilters,
    sendEvent: context.sendEvent,
  };
}
