import { createComparisonTableToolComponent } from 'instantsearch-ui-components';

import { Fragment, renderReactCompat } from '../../../util/vue-compat';

/**
 * Grounded comparison-table tool: renders `algolia_display_results` outputs
 * whose v2 `markdownTable` block names only the product objectIDs and the
 * attribute *keys* to compare — never the values. Every cell is hydrated
 * from the chat records store by objectID, so the model physically cannot
 * type (and therefore cannot hallucinate) a price or spec.
 *
 * Register it over the default grouped-results rendering (or a dedicated key)
 * through the chat's `tools` prop to have comparison answers rendered as a
 * grounded table:
 *
 * ```
 * tools: {
 *   [GroupedResultsToolType]: createComparisonTableTool(),
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
