/**
 * Shared Algolia configuration for demo and testing
 *
 * These are public demo credentials provided by Algolia for testing purposes.
 * They point to a demo e-commerce index with product data.
 *
 * @see https://www.algolia.com/doc/guides/building-search-ui/getting-started/js/#demo-credentials
 */

/**
 * Algolia Application ID
 * This is a public demo app ID
 */
export const APP_ID = 'latency';

/**
 * Algolia Search API Key
 * This is a public search-only API key (read-only)
 */
export const API_KEY = 'a4a3ef0b25a75b6df040f4d963c6e655';

/**
 * Index name containing product data with colour facets
 */
export const INDEX_NAME = 'STAGING_pwa_ecom_ui_template_products';

/**
 * Attribute name for colour refinement
 * Format: "label;value" where value is hex colour or image URL
 * Example: "Black;#000000" or "Pattern;https://example.com/pattern.png"
 */
export const ATTRIBUTE = 'color.filter_group';

/**
 * Separator used to split colour label from value
 * @default ';'
 */
export const SEPARATOR = ';';
