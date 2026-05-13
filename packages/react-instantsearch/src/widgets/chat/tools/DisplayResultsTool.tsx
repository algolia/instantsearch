import {
  ChevronLeftIcon,
  ChevronRightIcon,
  createButtonComponent,
  createDisplayResultsToolComponent,
} from 'instantsearch-ui-components';
import React, { createElement, Fragment } from 'react';

import { Carousel } from '../../../components';

import type {
  ClientSideToolComponentProps,
  UserClientSideTool,
} from 'instantsearch-core';
import type {
  Pragma,
  RecommendComponentProps,
  RecordWithObjectID,
} from 'instantsearch-ui-components';

type ItemComponent<TObject> = RecommendComponentProps<TObject>['itemComponent'];

function createDisplayResultsTool<TObject extends RecordWithObjectID>(
  itemComponent?: ItemComponent<TObject>
): UserClientSideTool {
  const DisplayResultsUIComponent = createDisplayResultsToolComponent<TObject>({
    createElement: createElement as Pragma,
    Fragment,
  });

  const Button = createButtonComponent({ createElement: createElement as Pragma });

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
            headerComponent={({
              canScrollLeft,
              canScrollRight,
              scrollLeft,
              scrollRight,
            }) => (
              <div className="ais-ChatToolDisplayResultsCarouselHeader">
                <div className="ais-ChatToolDisplayResultsCarouselHeaderCount">
                  {items.length} result{items.length > 1 ? 's' : ''}
                </div>
                <div className="ais-ChatToolDisplayResultsCarouselHeaderScrollButtons">
                  <Button
                    variant="outline"
                    size="sm"
                    iconOnly
                    onClick={scrollLeft}
                    disabled={!canScrollLeft}
                    className="ais-ChatToolDisplayResultsCarouselHeaderScrollButton"
                  >
                    <ChevronLeftIcon createElement={createElement as Pragma} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    iconOnly
                    onClick={scrollRight}
                    disabled={!canScrollRight}
                    className="ais-ChatToolDisplayResultsCarouselHeaderScrollButton"
                  >
                    <ChevronRightIcon
                      createElement={createElement as Pragma}
                    />
                  </Button>
                </div>
              </div>
            )}
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
