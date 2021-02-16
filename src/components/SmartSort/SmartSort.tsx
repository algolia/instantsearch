/** @jsx h */

import { h } from 'preact';
import Template from '../Template/Template';
import {
  SmartSortCSSClasses,
  SmartSortTemplates,
} from '../../widgets/smart-sort/smart-sort';

type SmartSortProps = {
  cssClasses: SmartSortCSSClasses;
  templates: SmartSortTemplates;
  isSmartSorted: boolean;
  isVirtualReplica: boolean;
  refine(relevancyStrictness: number | undefined): void;
};

const SmartSort = ({
  cssClasses,
  templates,
  isSmartSorted,
  isVirtualReplica,
  refine,
}: SmartSortProps) =>
  isVirtualReplica ? (
    <div className={cssClasses.root}>
      <Template
        templateKey="text"
        templates={templates}
        rootProps={{
          className: cssClasses.text,
        }}
        data={{ isSmartSorted }}
      />
      <button
        type="button"
        className={cssClasses.button}
        onClick={() => {
          if (isSmartSorted) {
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
          data={{ isSmartSorted }}
        />
      </button>
    </div>
  ) : null;

export default SmartSort;
