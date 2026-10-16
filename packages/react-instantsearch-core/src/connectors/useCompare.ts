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
 * configured comparison for the current selection; the `configurationId` is
 * set on `<CompareBar>` and shared with the toggles, which can omit it. The
 * `minItems` and `maxItems` limits are shared the same way: set them on
 * `<CompareBar>`, the toggles read them from there. They are dropped when
 * that widget unmounts; the selection itself is kept.
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
