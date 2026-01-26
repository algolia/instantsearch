/** @jsx h */

import { createSearchIndexTool } from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';
import { useMemo, useRef, useState } from 'preact/hooks';

import TemplateComponent from '../../components/Template/Template';

import type { IndexUiState } from '../../types';
import type {
  ChatTemplates,
  Tool as UserClientSideToolWithTemplate,
} from './chat';
import type {
  ClientSideToolComponentProps,
  RecordWithObjectID,
} from 'instantsearch-ui-components';

export function createCarouselTool<
  THit extends RecordWithObjectID = RecordWithObjectID
>(
  showViewAll: boolean,
  templates: ChatTemplates<THit>,
  getSearchPageURL?: (nextUiState: IndexUiState) => string
): UserClientSideToolWithTemplate {
  const SearchLayoutUIComponent = createSearchIndexTool<THit>({
    createElement: h,
    Fragment,
  });

  const itemComponent = templates.item
    ? ({ item }: { item: THit }) => {
        return (
          <TemplateComponent
            templates={templates}
            templateKey="item"
            rootTagName="fragment"
            data={item}
          />
        );
      }
    : undefined;

  const SearchLayoutComponent = (toolProps: ClientSideToolComponentProps) => {
    return (
      <SearchLayoutUIComponent
        useMemo={useMemo}
        useRef={useRef}
        useState={useState}
        getSearchPageURL={getSearchPageURL}
        headerProps={{ showViewAll }}
        itemComponent={itemComponent}
        toolProps={toolProps}
      />
    );
  };

  return {
    templates: { layout: SearchLayoutComponent },
  };
}
