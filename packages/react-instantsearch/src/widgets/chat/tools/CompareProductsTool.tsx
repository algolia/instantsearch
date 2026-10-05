import { createCompareProductsToolComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  ClientSideToolComponentProps,
  ComparisonTableTranslations,
  Pragma,
  RecommendComponentProps,
  RecordWithObjectID,
  UserClientSideTool,
} from 'instantsearch-ui-components';

type ItemComponent<TObject> = RecommendComponentProps<TObject>['itemComponent'];

/**
 * Builtin comparison tool (`algolia_compare_products`).
 *
 * Registered by default in the chat widget so the agent can lay a comparison
 * out as a table: the compared products across the top (rendered with the
 * widget's `itemComponent`, from the records the chat collected) and the
 * agent's criteria down the side, one value per product. See
 * `instantsearch-ui-components` `CompareProductsTool` for the contract.
 */
function createCompareProductsTool<TObject extends RecordWithObjectID>(
  itemComponent?: ItemComponent<TObject>,
  translations?: Partial<ComparisonTableTranslations>
): UserClientSideTool {
  const CompareProductsUIComponent =
    createCompareProductsToolComponent<TObject>({
      createElement: createElement as Pragma,
      Fragment,
    });

  const CompareProductsLayoutComponent = (
    toolProps: ClientSideToolComponentProps
  ) => (
    <CompareProductsUIComponent
      toolProps={toolProps}
      itemComponent={itemComponent}
      translations={translations}
    />
  );

  return {
    layoutComponent: CompareProductsLayoutComponent,
    // Render as the arguments stream in: the columns once `objectIDs` is
    // complete, then a row per finished criterion.
    streamInput: true,
    // Client-side tool: acknowledge the call so the agent's turn can complete.
    // The table itself is rendered from the call's input + the chat's records.
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
