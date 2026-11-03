import { connectCompare } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  CompareConnectorParams,
  CompareWidgetDescription,
} from 'instantsearch-core';

export type UseCompareProps = CompareConnectorParams;

/**
 * Exposes the shared comparison selection and the chat hand-off.
 *
 * The selection is shared by every `useCompare` call on the same InstantSearch
 * instance, so a per-hit "Compare" toggle (`toggleItem`) and the `<CompareBar>`
 * widget stay in sync. `compare()` opens the `<Chat>` widget and sends the
 * configured comparison for the current selection.
 */
export function useCompare(
  props: UseCompareProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<CompareConnectorParams, CompareWidgetDescription>(
    connectCompare,
    props,
    additionalWidgetProperties
  );
}
