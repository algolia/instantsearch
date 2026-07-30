import { createCompareProductsToolComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment, useMemo } from 'react';

import type {
  ClientSideToolComponentProps,
  ComparisonTableTranslations,
  Pragma,
  UserClientSideTool,
} from 'instantsearch-ui-components';

/**
 * Builtin comparison tool (`algolia_compare_products`).
 *
 * Registered by default in the chat widget so the agent can trigger a grounded
 * side-by-side comparison: its tool call names only the product objectIDs and
 * the attribute keys, and every cell is hydrated client-side from the real
 * `algolia_search_index` hits. The model never types a value, so it cannot
 * hallucinate one. See `instantsearch-ui-components` `CompareProductsTool` for
 * the contract, and `comparison-eval/README.md` for the study behind it.
 */
function createCompareProductsTool(
  translations?: Partial<ComparisonTableTranslations>
): UserClientSideTool {
  const CompareProductsUIComponent = createCompareProductsToolComponent({
    createElement: createElement as Pragma,
    Fragment,
    useMemo,
  });

  const CompareProductsLayoutComponent = (
    toolProps: ClientSideToolComponentProps
  ) => (
    <CompareProductsUIComponent
      toolProps={toolProps}
      translations={translations}
    />
  );

  return {
    layoutComponent: CompareProductsLayoutComponent,
    // Client-side tool: acknowledge the call so the agent's turn can complete.
    // The table itself is rendered from the call's input + real search hits.
    onToolCall: ({ input, addToolResult }) => {
      const objectIDs = (input as { objectIDs?: string[] } | undefined)
        ?.objectIDs;

      addToolResult({
        output: {
          status: 'displayed',
          objectIDs: Array.isArray(objectIDs) ? objectIDs : [],
        },
      });
    },
  };
}

export { createCompareProductsTool };
