import { connectGeoSearch } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  GeoHit,
  GeoSearchConnector,
  GeoSearchConnectorParams,
  GeoSearchWidgetDescription,
} from 'instantsearch-core';

export type UseGeoSearchProps<THit extends GeoHit = GeoHit> =
  GeoSearchConnectorParams<THit>;

export function useGeoSearch<THit extends GeoHit>(
  props?: UseGeoSearchProps<THit>,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    GeoSearchConnectorParams<THit>,
    GeoSearchWidgetDescription<THit>
  >(
    connectGeoSearch as GeoSearchConnector<THit>,
    props,
    additionalWidgetProperties
  );
}
