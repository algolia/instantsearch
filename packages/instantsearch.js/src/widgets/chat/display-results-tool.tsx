/** @jsx h */

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  createButtonComponent,
  createDisplayResultsToolComponent,
} from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import { carousel } from '../../templates';

import type {
  ChatTemplates,
  Tool as UserClientSideToolWithTemplate,
} from './chat';
import type { ClientSideToolComponentProps } from 'instantsearch-core';
import type { RecordWithObjectID } from 'instantsearch-ui-components';

export function createDisplayResultsTool<
  THit extends RecordWithObjectID = RecordWithObjectID
>(templates: ChatTemplates<THit>): UserClientSideToolWithTemplate {
  const DisplayResultsUIComponent = createDisplayResultsToolComponent<
    RecordWithObjectID<THit>
  >({
    createElement: h,
    Fragment,
  });

  const Button = createButtonComponent({ createElement: h });

  function DisplayResultsLayoutComponent(
    toolProps: ClientSideToolComponentProps
  ) {
    return (
      <DisplayResultsUIComponent
        toolProps={toolProps}
        groupCarouselComponent={({ items, sendEvent }) =>
          carousel({
            showNavigation: false,
            templates: {
              header: ({
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
                      <ChevronLeftIcon createElement={h} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      iconOnly
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
          })({
            items,
            templates: {
              item: ({ item }) => (
                <TemplateComponent
                  templates={templates}
                  templateKey="item"
                  data={item}
                  rootTagName="fragment"
                />
              ),
            },
            sendEvent,
          })
        }
      />
    );
  }

  return {
    templates: { layout: DisplayResultsLayoutComponent },
  };
}
