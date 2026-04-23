import { createDisplayResultsToolComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  ClientSideToolComponentProps,
  Pragma,
  RecommendComponentProps,
  RecordWithObjectID,
  UserClientSideTool,
} from 'instantsearch-ui-components';

type ItemComponent<TObject> = RecommendComponentProps<TObject>['itemComponent'];

function createDisplayResultsTool<TObject extends RecordWithObjectID>(
  itemComponent?: ItemComponent<TObject>
): UserClientSideTool {
  const DisplayResultsUIComponent = createDisplayResultsToolComponent<TObject>({
    createElement: createElement as Pragma,
    Fragment,
  });

  const DisplayResultsLayoutComponent = (
    toolProps: ClientSideToolComponentProps
  ) => {
    return (
      <DisplayResultsUIComponent
        useMemo={React.useMemo}
        useRef={React.useRef}
        useState={React.useState}
        itemComponent={itemComponent}
        toolProps={toolProps}
      />
    );
  };

  return {
    layoutComponent: DisplayResultsLayoutComponent,
  };
}

export { createDisplayResultsTool };
