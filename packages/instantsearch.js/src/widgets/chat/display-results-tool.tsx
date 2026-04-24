/** @jsx h */

import { createDisplayResultsToolComponent } from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import { carousel } from '../../templates';

import type {
  ChatTemplates,
  ClientSideToolTemplateData,
  Tool as UserClientSideToolWithTemplate,
} from './chat';
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

  const GroupCarousel = carousel({ showNavigation: false });

  function DisplayResultsLayoutComponent(
    toolProps: ClientSideToolTemplateData
  ) {
    return (
      <DisplayResultsUIComponent
        toolProps={toolProps}
        groupCarouselComponent={({ items, sendEvent }) =>
          GroupCarousel({
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
