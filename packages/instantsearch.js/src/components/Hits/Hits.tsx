/** @jsx h */

import { cx } from '@algolia/ui-components-shared';
import { createHits } from 'instantsearch-jsx';
import { h } from 'preact';

import { createInsightsEventHandler } from '../../lib/insights/listener';
import { warning } from '../../lib/utils';
import Template from '../Template/Template';

import type { PreparedTemplateProps } from '../../lib/templating';
import type { BindEventForHits, SendEventForHits } from '../../lib/utils';
import type { ComponentCSSClasses, Hit, InsightsClient } from '../../types';
import type { HitsCSSClasses, HitsTemplates } from '../../widgets/hits/hits';
import type { SearchResults } from 'algoliasearch-helper';

export type HitsComponentCSSClasses = ComponentCSSClasses<HitsCSSClasses>;
export type HitsComponentTemplates = Required<HitsTemplates>;

export type HitsProps = {
  results: SearchResults;
  hits: Hit[];
  insights?: InsightsClient;
  sendEvent: SendEventForHits;
  bindEvent: BindEventForHits;
  cssClasses: HitsComponentCSSClasses;
  templateProps: PreparedTemplateProps<HitsComponentTemplates>;
};

const UiHits = createHits({ createElement: h });

export default function Hits({
  results,
  hits,
  insights,
  sendEvent,
  cssClasses,
  bindEvent,
  templateProps,
}: HitsProps) {
  const handleInsightsClick = createInsightsEventHandler({
    insights,
    sendEvent,
  });

  if (results.hits.length === 0) {
    return (
      <Template
        {...templateProps}
        templateKey="empty"
        rootProps={{
          className: cx(cssClasses.root, cssClasses.emptyRoot),
          onClick: handleInsightsClick,
        }}
        data={results}
      />
    );
  }

  return (
    <UiHits
      hits={hits}
      sendEvent={sendEvent}
      classNames={cssClasses}
      itemComponent={({ hit, index }) => (
        <Template
          {...templateProps}
          templateKey="item"
          rootTagName="li"
          rootProps={{
            className: cssClasses.item,
            onClick: (event: MouseEvent) => {
              handleInsightsClick(event);
              sendEvent('click:internal', hit, 'Hit Clicked');
            },
            onAuxClick: (event: MouseEvent) => {
              handleInsightsClick(event);
              sendEvent('click:internal', hit, 'Hit Clicked');
            },
          }}
          key={hit.objectID}
          data={{
            ...hit,
            get __hitIndex() {
              warning(
                false,
                'The `__hitIndex` property is deprecated. Use the absolute `__position` instead.'
              );
              return index;
            },
          }}
          bindEvent={bindEvent}
          sendEvent={sendEvent}
        />
      )}
    />
  );
}
