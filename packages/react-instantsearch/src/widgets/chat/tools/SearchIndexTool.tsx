import { createCarouselToolComponent } from 'instantsearch-ui-components';
import React, {
  createElement,
  useMemo,
  useState,
  useRef,
  Fragment,
} from 'react';

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
  const SearchLayoutUIComponent = createCarouselToolComponent<TObject>({
    createElement: createElement as Pragma,
    Fragment,
    useMemo,
    useRef,
    useState,
  });

  const SearchLayoutComponent = (toolProps: ClientSideToolComponentProps) => {
    return (
      <SearchLayoutUIComponent
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
