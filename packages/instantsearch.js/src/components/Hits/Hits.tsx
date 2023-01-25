/** @jsx h */

import { h } from 'preact';
import { cx } from '@algolia/ui-components-shared';
import Template from '../Template/Template';
import type { SearchResults } from 'algoliasearch-helper';
import type { BindEventForHits, SendEventForHits } from '../../lib/utils';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { ComponentCSSClasses, Hit } from '../../types';
import type { HitsCSSClasses, HitsTemplates } from '../../widgets/hits/hits';

export type HitsComponentCSSClasses = ComponentCSSClasses<HitsCSSClasses>;
export type HitsComponentTemplates = Required<HitsTemplates>;

export type HitsProps = {
  results: SearchResults;
  hits: Hit[];
  sendEvent?: SendEventForHits;
  bindEvent?: BindEventForHits;
  cssClasses: HitsComponentCSSClasses;
  templateProps: PreparedTemplateProps<HitsComponentTemplates>;
};

const Hits = ({
  results,
  hits,
  bindEvent,
  sendEvent,
  cssClasses,
  templateProps,
}: HitsProps) => {
  if (results.hits.length === 0) {
    return (
      <Template
        {...templateProps}
        templateKey="empty"
        rootProps={{
          className: cx(cssClasses.root, cssClasses.emptyRoot),
        }}
        data={results}
      />
    );
  }

  return (
    <div className={cssClasses.root}>
      <ol className={cssClasses.list}>
        {hits.map((hit, index) => (
          <Template
            {...templateProps}
            templateKey="item"
            rootTagName="li"
            rootProps={{
              className: cssClasses.item,
              onClick: () => {
                sendEvent!(
                  'click:internal',
                  hit,
                  'Internal Hits component: Hit Clicked'
                );
              },
            }}
            key={hit.objectID}
            data={{
              ...hit,
              __hitIndex: index,
            }}
            bindEvent={bindEvent}
            sendEvent={sendEvent}
          />
        ))}
      </ol>
    </div>
  );
};

export default Hits;
