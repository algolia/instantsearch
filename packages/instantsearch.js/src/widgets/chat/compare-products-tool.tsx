/** @jsx h */

import { createCompareProductsToolComponent } from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';

import TemplateComponent from '../../components/Template/Template';

import type {
  ChatTemplates,
  ClientSideToolTemplateData,
  Tool as UserClientSideToolWithTemplate,
} from './chat';
import type {
  ComparisonTableTranslations,
  CompareProductsToolProps,
  RecordWithObjectID,
} from 'instantsearch-ui-components';

/**
 * Builtin comparison tool (`algolia_compare_products`) — Preact flavor.
 *
 * Registered by default in the chat widget so the agent can lay a comparison
 * out as a table: the compared products across the top (rendered with the
 * widget's `item` template when one is provided, otherwise the record's name,
 * from the records the chat collected) and the agent's criteria down the
 * side, one value per product. See `instantsearch-ui-components`
 * `CompareProductsTool` for the contract.
 */
export function createCompareProductsTool<
  THit extends RecordWithObjectID = RecordWithObjectID,
>(
  templates?: ChatTemplates<THit>,
  translations?: Partial<ComparisonTableTranslations>
): UserClientSideToolWithTemplate {
  const CompareProductsUIComponent = createCompareProductsToolComponent<
    RecordWithObjectID<THit>
  >({
    createElement: h,
    Fragment,
  });

  const itemComponent:
    | CompareProductsToolProps<RecordWithObjectID<THit>>['itemComponent']
    | undefined = templates
    ? ({ item }) => (
        <TemplateComponent
          templates={templates}
          templateKey="item"
          data={item}
          rootTagName="fragment"
        />
      )
    : undefined;

  function CompareProductsLayoutComponent(
    toolProps: ClientSideToolTemplateData
  ) {
    return (
      <CompareProductsUIComponent
        toolProps={toolProps}
        itemComponent={itemComponent}
        translations={translations}
      />
    );
  }

  return {
    templates: { layout: CompareProductsLayoutComponent },
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
