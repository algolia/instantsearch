/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';
import Template from '../Template/Template.js';
import type { SearchResults } from 'algoliasearch-helper';
import type {
  BindEventForHits,
  SendEventForHits,
} from '../../lib/utils/index.js';
import type {
  ComponentCSSClasses,
  Hits as HitsArray,
} from '../../types/index.js';
import type { HitsCSSClasses, HitsTemplates } from '../../widgets/hits/hits.js';
import type { PreparedTemplateProps } from '../../lib/utils/prepareTemplateProps.js';

export type HitsComponentCSSClasses = ComponentCSSClasses<HitsCSSClasses>;
export type HitsComponentTemplates = Required<HitsTemplates>;

export type HitsProps = {
  results: SearchResults;
  hits: HitsArray;
  sendEvent?: SendEventForHits;
  bindEvent?: BindEventForHits;
  cssClasses: HitsComponentCSSClasses;
  templateProps: PreparedTemplateProps<HitsComponentTemplates>;
};

const Hits = ({
  results,
  hits,
  bindEvent,
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
            rootProps={{ className: cssClasses.item }}
            key={hit.objectID}
            data={{
              ...hit,
              __hitIndex: index,
            }}
            bindEvent={bindEvent}
          />
        ))}
      </ol>
    </div>
  );
};

Hits.defaultProps = {
  results: { hits: [] },
  hits: [],
};

export default Hits;
