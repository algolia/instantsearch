import connectCompare from 'instantsearch.js/es/connectors/compare/connectCompare';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  CompareConnectorParams,
  CompareWidgetDescription,
} from 'instantsearch.js/es/connectors/compare/connectCompare';

export type UseCompareProps = CompareConnectorParams;

/**
 * Exposes the shared comparison selection and the chat hand-off.
 *
 * The selection is shared by every `useCompare` call on the same InstantSearch
 * instance, so a per-hit "Compare" toggle (`toggleItem`) and the `<CompareBar>`
 * widget stay in sync. `compare()` opens the `<Chat>` widget and sends the
 * comparison message for the current selection.
 */
export function useCompare(
  props: UseCompareProps = {},
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<CompareConnectorParams, CompareWidgetDescription>(
    connectCompare,
    props,
    additionalWidgetProperties
  );
}
