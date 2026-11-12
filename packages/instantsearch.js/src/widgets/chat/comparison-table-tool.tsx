/** @jsx h */

import { createComparisonTableToolComponent } from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';

import type { Tool as UserClientSideToolWithTemplate } from './chat';
import type { ClientSideToolComponentProps } from 'instantsearch-core';
import type { ComparisonTableTranslations } from 'instantsearch-ui-components';

/**
 * Grounded comparison-table tool (the `algolia_compare_products` tool's v2
 * `markdownTable` path) — Preact flavor.
 *
 * The agent emits a v2 `markdownTable` display block that names only the
 * product objectIDs and the attribute *keys* to compare — never the values.
 * Every cell is hydrated from the chat records store (the hits the search
 * tools actually fetched) by objectID, so the model physically cannot type
 * (and therefore cannot hallucinate) a price or spec. See
 * `instantsearch-ui-components` `ComparisonTableTool` for the contract.
 *
 * Register it under the tool key the agent emits the block for (by default
 * `CompareProductsToolType`) through the chat widget's `tools` option to have
 * comparison answers rendered as a grounded table.
 */
export function createComparisonTableTool(
  translations?: Partial<ComparisonTableTranslations>
): UserClientSideToolWithTemplate {
  const ComparisonTableUIComponent = createComparisonTableToolComponent({
    createElement: h,
    Fragment,
  });

  function ComparisonTableLayoutComponent(
    toolProps: ClientSideToolComponentProps
  ) {
    return (
      <ComparisonTableUIComponent
        toolProps={toolProps}
        translations={translations}
      />
    );
  }

  return {
    templates: { layout: ComparisonTableLayoutComponent },
  };
}
