import {
  ChevronLeftIcon,
  ChevronRightIcon,
  createButtonComponent,
  createGroupedResultsToolComponent,
} from 'instantsearch-ui-components';
import React, { createElement, Fragment, useEffect, useRef } from 'react';

import { Carousel } from '../../../components';

import type {
  ClientSideToolComponentProps,
  HeaderComponentProps,
  Pragma,
  RecommendComponentProps,
  RecordWithObjectID,
  UserClientSideTool,
} from 'instantsearch-ui-components';

type ItemComponent<TObject> = RecommendComponentProps<TObject>['itemComponent'];

function createGroupedResultsTool<TObject extends RecordWithObjectID>(
  itemComponent?: ItemComponent<TObject>
): UserClientSideTool {
  const GroupedResultsUIComponent = createGroupedResultsToolComponent<TObject>({
    createElement: createElement as Pragma,
    Fragment,
    useEffect,
    useRef,
  });

  const Button = createButtonComponent({
    createElement: createElement as Pragma,
  });

  const GroupedResultsCarouselHeader = ({
    nbItems,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
  }: HeaderComponentProps) => (
    <div className="ais-ChatToolGroupedResultsCarouselHeader">
      <div className="ais-ChatToolGroupedResultsCarouselHeaderCount">
        {nbItems} result{nbItems > 1 ? 's' : ''}
      </div>
      <div className="ais-ChatToolGroupedResultsCarouselHeaderScrollButtons">
        <Button
          variant="outline"
          size="sm"
          iconOnly
          aria-label="Previous"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          className="ais-ChatToolGroupedResultsCarouselHeaderScrollButton"
        >
          <ChevronLeftIcon createElement={createElement as Pragma} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconOnly
          aria-label="Next"
          onClick={scrollRight}
          disabled={!canScrollRight}
          className="ais-ChatToolGroupedResultsCarouselHeaderScrollButton"
        >
          <ChevronRightIcon createElement={createElement as Pragma} />
        </Button>
      </div>
    </div>
  );

  const GroupedResultsLayoutComponent = (
    toolProps: ClientSideToolComponentProps
  ) => {
    return (
      <GroupedResultsUIComponent
        toolProps={toolProps}
        groupCarouselComponent={({ items, sendEvent }) => (
          <Carousel
            items={items}
            itemComponent={itemComponent}
            sendEvent={sendEvent}
            showNavigation={false}
            headerComponent={GroupedResultsCarouselHeader}
          />
        )}
      />
    );
  };

  return {
    layoutComponent: GroupedResultsLayoutComponent,
    streamInput: true,
  };
}

export { createGroupedResultsTool };
