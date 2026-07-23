/** @jsx h */

import { createCarouselToolComponent } from 'instantsearch-ui-components';
import { Fragment, h } from 'preact';
import { useMemo, useRef, useState } from 'preact/hooks';

import TemplateComponent from '../../components/Template/Template';

import type {
  ChatTemplates,
  Tool as UserClientSideToolWithTemplate,
} from './chat';
import type { SearchParameters } from 'algoliasearch-helper';
import type {
  ClientSideToolComponentProps,
  RecordWithObjectID,
} from 'instantsearch-ui-components';

export function createCarouselTool<
  THit extends RecordWithObjectID = RecordWithObjectID
>(
  showViewAll: boolean,
  templates: ChatTemplates<THit>,
  getSearchPageURL?: (params: SearchParameters) => string
): UserClientSideToolWithTemplate {
  const SearchLayoutUIComponent = createCarouselToolComponent<THit>({
    createElement: h,
    Fragment,
    useMemo,
    useRef,
    useState,
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
