import { createDisplayResultsToolComponent } from 'instantsearch-ui-components';
import {
  buildConversationHits,
  normalizeDisplayResultsOutput,
} from 'instantsearch.js/es/lib/chat';
import React, { createElement, Fragment, useMemo } from 'react';

import type {
  ClientSideToolComponentProps,
  DisplayResultsItemComponentProps,
  DisplayResultsGroupHeaderProps,
  DisplayResultsTranslations,
  Pragma,
  RecordWithObjectID,
  UserClientSideTool,
} from 'instantsearch-ui-components';

type ItemComponent<THit extends RecordWithObjectID> = (
  props: DisplayResultsItemComponentProps<THit>
) => JSX.Element;

type GroupHeaderComponent = (
  props: DisplayResultsGroupHeaderProps
) => JSX.Element | null;

function createDisplayResultsTool<TObject extends RecordWithObjectID>(
  itemComponent?: ItemComponent<TObject>,
  groupHeaderComponent?: GroupHeaderComponent,
  translations?: Partial<DisplayResultsTranslations>
): UserClientSideTool {
  const DisplayResultsLayout = createDisplayResultsToolComponent<TObject>({
    createElement: createElement as Pragma,
    Fragment,
  });

  function DisplayResultsLayoutComponent(
    toolProps: ClientSideToolComponentProps
  ) {
    return (
      <DisplayResultsLayout
        useMemo={useMemo}
        toolProps={toolProps}
        normalizeOutput={normalizeDisplayResultsOutput}
        buildConversationHits={buildConversationHits}
        itemComponent={itemComponent}
        groupHeaderComponent={groupHeaderComponent}
        translations={translations}
      />
    );
  }

  return {
    layoutComponent: DisplayResultsLayoutComponent,
  };
}

export { createDisplayResultsTool };
