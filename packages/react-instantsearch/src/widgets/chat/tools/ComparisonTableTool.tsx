import { createComparisonTableToolComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment, useMemo } from 'react';

import type {
  ClientSideToolComponentProps,
  ComparisonTableTranslations,
  Pragma,
  UserClientSideTool,
} from 'instantsearch-ui-components';

/**
 * Grounded comparison-table tool (prototype).
 *
 * Renders a v2 `markdownTable` display block whose every cell is hydrated from
 * the real `algolia_search_index` hits by objectID — the agent supplies only the
 * objectIDs and the attribute keys, never the values. See
 * `instantsearch-ui-components` `ComparisonTableTool` for the contract.
 *
 * Register under the display-results tool key (or a dedicated key) in
 * `createDefaultTools` to have comparison answers rendered as a grounded table
 * instead of the model-authored markdown table.
 */
function createComparisonTableTool(
  translations?: Partial<ComparisonTableTranslations>
): UserClientSideTool {
  const ComparisonTableUIComponent = createComparisonTableToolComponent({
    createElement: createElement as Pragma,
    Fragment,
    useMemo,
  });

  const ComparisonTableLayoutComponent = (
    toolProps: ClientSideToolComponentProps
  ) => (
    <ComparisonTableUIComponent
      toolProps={toolProps}
      translations={translations}
    />
  );

  return {
    layoutComponent: ComparisonTableLayoutComponent,
  };
}

export { createComparisonTableTool };
