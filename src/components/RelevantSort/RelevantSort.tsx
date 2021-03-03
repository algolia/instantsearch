/** @jsx h */

import { h } from 'preact';
import Template from '../Template/Template';
import {
  RelevantSortCSSClasses,
  RelevantSortTemplates,
} from '../../widgets/relevant-sort/relevant-sort';

type RelevantSortProps = {
  cssClasses: RelevantSortCSSClasses;
  templates: RelevantSortTemplates;
  isRelevantSorted: boolean;
  isVirtualReplica: boolean;
  refine(relevancyStrictness: number | undefined): void;
};

const RelevantSort = ({
  cssClasses,
  templates,
  isRelevantSorted,
  isVirtualReplica,
  refine,
}: RelevantSortProps) =>
  isVirtualReplica ? (
    <div className={cssClasses.root}>
      <Template
        templateKey="text"
        templates={templates}
        rootProps={{
          className: cssClasses.text,
        }}
        data={{ isRelevantSorted }}
      />
      <button
        type="button"
        className={cssClasses.button}
        onClick={() => {
          if (isRelevantSorted) {
            refine(0);
          } else {
            refine(undefined);
          }
        }}
      >
        <Template
          rootTagName="span"
          templateKey="button"
          templates={templates}
          data={{ isRelevantSorted }}
        />
      </button>
    </div>
  ) : null;

export default RelevantSort;
