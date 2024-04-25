import connectRelatedProducts from 'instantsearch.js/es/connectors/related-products/connectRelatedProducts';

import { useConnector } from '../hooks/useConnector';

import type { AdditionalWidgetProperties } from '../hooks/useConnector';
import type {
  RelatedProductsConnectorParams,
  RelatedProductsWidgetDescription,
} from 'instantsearch.js/es/connectors/related-products/connectRelatedProducts';

export type UseRelatedProductsProps = RelatedProductsConnectorParams;

export function useRelatedProducts(
  props: UseRelatedProductsProps,
  additionalWidgetProperties?: AdditionalWidgetProperties
) {
  return useConnector<
    RelatedProductsConnectorParams,
    RelatedProductsWidgetDescription
  >(connectRelatedProducts, props, additionalWidgetProperties);
}
