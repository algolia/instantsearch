import { createComparisonTableToolComponent } from 'instantsearch-ui-components';

import { Fragment, renderReactCompat } from '../../../util/vue-compat';

/**
 * Grounded comparison-table tool: renders the v2 `markdownTable` output block
 * of the `algolia_compare_products` tool, which names only the product
 * objectIDs and the attribute *keys* to compare — never the values. Every
 * cell is hydrated from the chat records store by objectID, so the model
 * physically cannot type (and therefore cannot hallucinate) a price or spec.
 *
 * Register it under the tool key the agent emits the block for (by default
 * `CompareProductsToolType`) through the chat's `tools` prop to have
 * comparison answers rendered as a grounded table:
 *
 * ```
 * tools: {
 *   [CompareProductsToolType]: createComparisonTableTool(),
 * }
 * ```
 */
export function createComparisonTableTool(translations) {
  const layoutComponent = {
    name: 'AisChatComparisonTableTool',
    inheritAttrs: false,
    props: {
      context: { type: Object, required: true },
    },
    render: renderReactCompat(function (h) {
      if (!this.ComparisonTableUiComponent) {
        this.ComparisonTableUiComponent = createComparisonTableToolComponent({
          createElement: h,
          Fragment,
        });
      }

      return h(this.ComparisonTableUiComponent, {
        toolProps: { context: this.context },
        translations,
      });
    }),
  };

  return { layoutComponent };
}
