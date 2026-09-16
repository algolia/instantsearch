/** @jsx h */

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  createButtonComponent,
  createGroupedResultsToolComponent,
} from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import TemplateComponent from '../../components/Template/Template';
import { carousel } from '../../templates';

import type {
  ChatTemplates,
  ClientSideToolTemplateData,
  Tool as UserClientSideToolWithTemplate,
} from './chat';
import type {
  CarouselProps,
  RecordWithObjectID,
} from 'instantsearch-ui-components';

export function createGroupedResultsTool<
  THit extends RecordWithObjectID = RecordWithObjectID,
>(templates: ChatTemplates<THit>): UserClientSideToolWithTemplate {
  const GroupedResultsUIComponent = createGroupedResultsToolComponent<
    RecordWithObjectID<THit>
  >({
    createElement: h,
    Fragment,
    useEffect,
    useRef,
  });

  const Button = createButtonComponent({ createElement: h });

  const groupedResultsCarousel = carousel<RecordWithObjectID<THit>>({
    showNavigation: false,
    templates: {
      header: ({
        nbItems,
        canScrollLeft,
        canScrollRight,
        scrollLeft,
        scrollRight,
      }) => (
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
              <ChevronLeftIcon createElement={h} />
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
              <ChevronRightIcon createElement={h} />
            </Button>
          </div>
        </div>
      ),
    },
  });

  const itemComponent: NonNullable<
    CarouselProps<RecordWithObjectID<THit>>['itemComponent']
  > = ({ item }) => (
    <TemplateComponent
      templates={templates}
      templateKey="item"
      data={item}
      rootTagName="fragment"
    />
  );

  function GroupedResultsLayoutComponent(
    toolProps: ClientSideToolTemplateData
  ) {
    return (
      <GroupedResultsUIComponent
        toolProps={toolProps}
        groupCarouselComponent={({ items, sendEvent }) =>
          groupedResultsCarousel({
            items,
            templates: {
              item: itemComponent,
            },
            sendEvent,
          })
        }
      />
    );
  }

  return {
    templates: { layout: GroupedResultsLayoutComponent },
    streamInput: true,
  };
}
