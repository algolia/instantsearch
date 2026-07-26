/** @jsx h */

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  createButtonComponent,
  createDisplayResultsToolComponent,
} from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';
import { useMemo } from 'preact/hooks';

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

export function createDisplayResultsTool<
  THit extends RecordWithObjectID = RecordWithObjectID
>(templates: ChatTemplates<THit>): UserClientSideToolWithTemplate {
  const DisplayResultsUIComponent = createDisplayResultsToolComponent<
    RecordWithObjectID<THit>
  >({
    createElement: h,
    Fragment,
    useMemo,
  });

  const Button = createButtonComponent({ createElement: h });

  const displayResultsCarousel = carousel<RecordWithObjectID<THit>>({
    showNavigation: false,
    templates: {
      header: ({
        nbItems,
        canScrollLeft,
        canScrollRight,
        scrollLeft,
        scrollRight,
      }) => (
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
              <ChevronLeftIcon createElement={h} />
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

  function DisplayResultsLayoutComponent(
    toolProps: ClientSideToolTemplateData
  ) {
    return (
      <DisplayResultsUIComponent
        toolProps={toolProps}
        groupCarouselComponent={({ items, sendEvent }) =>
          displayResultsCarousel({
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
    templates: { layout: DisplayResultsLayoutComponent },
    streamInput: true,
  };
}
