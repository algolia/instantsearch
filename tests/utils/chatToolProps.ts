import type { ClientSideToolComponentProps } from 'instantsearch-ui-components';

/**
 * Chat tool layout components receive the shared `context` *and* the deprecated
 * root-level props the widget still passes for back compat. Fixtures only build
 * the context, so this mirrors it into both shapes.
 *
 * Delete alongside the deprecated root props in the next major.
 */
export function chatToolProps(
  context: ClientSideToolComponentProps['context']
): ClientSideToolComponentProps {
  return {
    context,
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
