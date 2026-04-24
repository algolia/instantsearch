import { createDisplayResultsToolComponent } from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import { Carousel } from '../../../components';

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
        toolProps={toolProps}
        groupCarouselComponent={({ items, sendEvent }) => (
          <Carousel
            items={items}
            itemComponent={itemComponent}
            sendEvent={sendEvent}
            showNavigation={false}
          />
        )}
      />
    );
  };

  return {
    layoutComponent: DisplayResultsLayoutComponent,
  };
}

export { createDisplayResultsTool };
