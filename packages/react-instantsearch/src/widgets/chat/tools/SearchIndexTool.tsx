import { createSearchIndexTool } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type {
  ClientSideToolComponentProps,
  Pragma,
  RecommendComponentProps,
  RecordWithObjectID,
  UserClientSideTool,
} from 'instantsearch-ui-components';
import type { IndexUiState } from 'instantsearch.js';

type ItemComponent<TObject> = RecommendComponentProps<TObject>['itemComponent'];

function createCarouselTool<TObject extends RecordWithObjectID>(
  showViewAll: boolean,
  itemComponent?: ItemComponent<TObject>,
  getSearchPageURL?: (nextUiState: IndexUiState) => string
): UserClientSideTool {
  const SearchLayoutUIComponent = createSearchIndexTool<TObject>({
    createElement: createElement as Pragma,
    Fragment,
  });

  const SearchLayoutComponent = (toolProps: ClientSideToolComponentProps) => {
    return (
      <SearchLayoutUIComponent
        useMemo={React.useMemo}
        useRef={React.useRef}
        useState={React.useState}
        getSearchPageURL={getSearchPageURL}
        headerProps={{ showViewAll }}
        itemComponent={itemComponent}
        toolProps={toolProps}
      />
    );
  };

  return {
    layoutComponent: SearchLayoutComponent,
  };
}

export { createCarouselTool };
