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
  relevancyStrictness?: number;
  refine(relevancyStrictness: number | undefined): void;
};

const SmartSort = ({
  cssClasses,
  templates,
  isSmartSorted,
  relevancyStrictness,
  refine,
}: SmartSortProps) => (
  <button
    className={cssClasses.root}
    type="button"
    onClick={() => {
      if (isSmartSorted) {
        refine(0);
      } else {
        refine(relevancyStrictness);
      }
    }}
  >
    <Template
      rootTagName="span"
      templateKey="default"
      templates={templates}
      data={{ isSmartSorted }}
    />
  </button>
);

export default SmartSort;
