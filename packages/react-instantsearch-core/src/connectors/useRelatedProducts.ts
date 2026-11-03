import { connectRelatedProducts as connectRelatedProducts } from 'instantsearch-core';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  RelatedProductsConnector,
  RelatedProductsConnectorParams,
  RelatedProductsWidgetDescription,
} from 'instantsearch-core';
import type { BaseHit } from 'instantsearch.js';

export type UseRelatedProductsProps<THit extends BaseHit = BaseHit> =
  RelatedProductsConnectorParams<THit>;

export function useRelatedProducts<THit extends BaseHit = BaseHit>(
  props: UseRelatedProductsProps<THit>,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    RelatedProductsConnectorParams<THit>,
    RelatedProductsWidgetDescription<THit>
  >(
    connectRelatedProducts as RelatedProductsConnector<THit>,
    props,
    additionalWidgetProperties
  );
}
