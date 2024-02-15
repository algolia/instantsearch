/** @jsx h */

import { h } from 'preact';

import Template from '../Template/Template';

import type { ComponentCSSClasses } from '../../types';
import type {
  RelevantSortCSSClasses,
  RelevantSortTemplates,
} from '../../widgets/relevant-sort/relevant-sort';

export type RelevantSortComponentCSSClasses =
  ComponentCSSClasses<RelevantSortCSSClasses>;

export type RelevantSortComponentTemplates = Required<RelevantSortTemplates>;

type RelevantSortProps = {
  cssClasses: RelevantSortComponentCSSClasses;
  templates: RelevantSortComponentTemplates;
  isRelevantSorted: boolean;
  isVirtualReplica: boolean;
  refine: (relevancyStrictness: number | undefined) => void;
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
