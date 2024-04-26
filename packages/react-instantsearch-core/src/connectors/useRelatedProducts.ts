import connectRelatedProducts from 'instantsearch.js/es/connectors/related-products/connectRelatedProducts';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type { BaseHit } from 'instantsearch.js';
import type {
  RelatedProductsConnector,
  RelatedProductsConnectorParams,
  RelatedProductsWidgetDescription,
} from 'instantsearch.js/es/connectors/related-products/connectRelatedProducts';

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
