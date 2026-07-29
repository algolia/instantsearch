import {
  ChevronLeftIcon,
  ChevronRightIcon,
  createButtonComponent,
  createDisplayResultsToolComponent,
} from 'instantsearch-ui-components';
import React, {
  createElement,
  Fragment,
  useEffect,
  useMemo,
  useRef,
} from 'react';

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

function createDisplayResultsTool<TObject extends RecordWithObjectID>(
  itemComponent?: ItemComponent<TObject>
): UserClientSideTool {
  const DisplayResultsUIComponent = createDisplayResultsToolComponent<TObject>({
    createElement: createElement as Pragma,
    Fragment,
    useEffect,
    useMemo,
    useRef,
  });

  const Button = createButtonComponent({
    createElement: createElement as Pragma,
  });

  const DisplayResultsCarouselHeader = ({
    nbItems,
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
  }: HeaderComponentProps) => (
    <div className="ais-ChatToolDisplayResultsCarouselHeader">
      <div className="ais-ChatToolDisplayResultsCarouselHeaderCount">
        {nbItems} result{nbItems > 1 ? 's' : ''}
      </div>
      <div className="ais-ChatToolDisplayResultsCarouselHeaderScrollButtons">
        <Button
          variant="outline"
          size="sm"
          iconOnly
          aria-label="Previous"
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
          aria-label="Next"
          onClick={scrollRight}
          disabled={!canScrollRight}
          className="ais-ChatToolDisplayResultsCarouselHeaderScrollButton"
        >
          <ChevronRightIcon createElement={createElement as Pragma} />
        </Button>
      </div>
    </div>
  );

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
            headerComponent={DisplayResultsCarouselHeader}
          />
        )}
      />
    );
  };

  return {
    layoutComponent: DisplayResultsLayoutComponent,
    streamInput: true,
  };
}

export { createDisplayResultsTool };
