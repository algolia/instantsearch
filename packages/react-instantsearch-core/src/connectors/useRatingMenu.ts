import connectRatingMenu from 'instantsearch.js/es/connectors/rating-menu/connectRatingMenu';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  RatingMenuConnectorParams,
  RatingMenuWidgetDescription,
} from 'instantsearch.js/es/connectors/rating-menu/connectRatingMenu';

export type UseRatingMenuProps = RatingMenuConnectorParams;

export function useRatingMenu(
  props: UseRatingMenuProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<RatingMenuConnectorParams, RatingMenuWidgetDescription>(
    connectRatingMenu,
    props,
    additionalWidgetProperties
  );
}
