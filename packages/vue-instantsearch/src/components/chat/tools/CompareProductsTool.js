import { createCompareProductsToolComponent } from 'instantsearch-ui-components';

import { Fragment, renderReactCompat } from '../../../util/vue-compat';

/**
 * Vue equivalent of react-instantsearch's chat `CompareProductsTool`
 * (`algolia_compare_products`): lays a comparison out as a table — the
 * compared products across the top (rendered with the widget's item
 * renderer, from the records the chat collected) and the agent's criteria
 * down the side.
 *
 * `getItemComponent` resolves the item renderer at render time (see
 * `SearchIndexTool.js`).
 */
export function createCompareProductsTool(getItemComponent, translations) {
  const layoutComponent = {
    name: 'AisChatCompareProductsTool',
    inheritAttrs: false,
    props: {
      context: { type: Object, required: true },
    },
    render: renderReactCompat(function (h) {
      if (!this.CompareProductsUiComponent) {
        this.CompareProductsUiComponent = createCompareProductsToolComponent({
          createElement: h,
          Fragment,
        });
      }

      return h(this.CompareProductsUiComponent, {
        toolProps: Object.assign({}, this.$attrs, { context: this.context }),
        itemComponent: getItemComponent(),
        translations,
      });
    }),
  };

  return {
    layoutComponent,
    // Render as the arguments stream in: the columns once `objectIDs` is
    // complete, then a row per finished criterion.
    streamInput: true,
    // Client-side tool: acknowledge the call so the agent's turn can complete.
    // The table itself is rendered from the call's input + the chat's records.
    onToolCall: ({ input, addToolResult }) => {
      const objectIDs = input && input.objectIDs;

      addToolResult({
        output: {
          status: 'displayed',
          objectIDs: Array.isArray(objectIDs) ? objectIDs : [],
        },
      });
    },
  };
}
