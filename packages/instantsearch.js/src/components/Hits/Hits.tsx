/** @jsx h */

import { cx } from '@algolia/ui-components-shared';
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

export default function Hits({
  results,
  hits,
  insights,
  bindEvent,
  sendEvent,
  cssClasses,
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
    <div className={cssClasses.root} onClick={handleInsightsClick}>
      <ol className={cssClasses.list}>
        {hits.map((hit, index) => (
          <Template
            {...templateProps}
            templateKey="item"
            rootTagName="li"
            rootProps={{
              className: cssClasses.item,
              onClick: () => {
                sendEvent('click', hit, 'Hit Clicked');
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
        ))}
      </ol>
    </div>
  );
}
