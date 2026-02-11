import { createSearchIndexTool } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import type { SearchParameters } from 'algoliasearch-helper';
import type {
  ClientSideToolComponentProps,
  Pragma,
  RecommendComponentProps,
  RecordWithObjectID,
  UserClientSideTool,
} from 'instantsearch-ui-components';

type ItemComponent<TObject> = RecommendComponentProps<TObject>['itemComponent'];

function createCarouselTool<TObject extends RecordWithObjectID>(
  showViewAll: boolean,
  itemComponent?: ItemComponent<TObject>,
  getSearchPageURL?: (params: SearchParameters) => string
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
