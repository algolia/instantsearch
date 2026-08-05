import {
  createCarouselToolComponent,
  getHitsFromToolOutput,
} from 'instantsearch-ui-components';
import React, {
  createElement,
  useEffect,
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
    useEffect,
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
    getRecords: getHitsFromToolOutput,
  };
}

export { createCarouselTool };
