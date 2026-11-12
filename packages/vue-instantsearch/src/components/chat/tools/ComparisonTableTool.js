import { createComparisonTableToolComponent } from 'instantsearch-ui-components';

import { Fragment, renderReactCompat } from '../../../util/vue-compat';

/**
 * Vue equivalent of react-instantsearch's chat `ComparisonTableTool`:
 * the grounded comparison-table renderer for `algolia_display_results`
 * outputs. The agent emits a v2 `markdownTable` display block that names only
 * the product objectIDs and the attribute *keys* to compare — never the
 * values — and every cell is hydrated from the chat records store by
 * objectID. See `instantsearch-ui-components` `ComparisonTableTool` for the
 * contract.
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
