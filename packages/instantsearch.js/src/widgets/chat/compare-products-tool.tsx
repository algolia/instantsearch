/** @jsx h */

import { createCompareProductsToolComponent } from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';
import { useMemo } from 'preact/hooks';

import type {
  ClientSideToolTemplateData,
  Tool as UserClientSideToolWithTemplate,
} from './chat';
import type { ComparisonTableTranslations } from 'instantsearch-ui-components';

/**
 * Builtin comparison tool (`algolia_compare_products`) — Preact flavor.
 *
 * Registered by default in the chat widget so the agent can trigger a grounded
 * side-by-side comparison: its tool call names only the product objectIDs and
 * the attribute keys, and every cell is hydrated client-side from the real
 * `algolia_search_index` hits. The model never types a value, so it cannot
 * hallucinate one. See `instantsearch-ui-components` `CompareProductsTool` for
 * the contract.
 */
export function createCompareProductsTool(
  translations?: Partial<ComparisonTableTranslations>
): UserClientSideToolWithTemplate {
  const CompareProductsUIComponent = createCompareProductsToolComponent({
    createElement: h,
    Fragment,
    useMemo,
  });

  function CompareProductsLayoutComponent(
    toolProps: ClientSideToolTemplateData
  ) {
    return (
      <CompareProductsUIComponent
        toolProps={toolProps}
        translations={translations}
      />
    );
  }

  return {
    templates: { layout: CompareProductsLayoutComponent },
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
