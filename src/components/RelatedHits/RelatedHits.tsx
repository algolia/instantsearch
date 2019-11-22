/** @jsx h */

import { h } from 'preact';
import {
  RelatedHitsCSSClasses,
  RelatedHitsTemplates,
} from '../../widgets/related-hits/related-hits';
import Template from '../Template/Template';

type RelatedHitsProps = {
  cssClasses: RelatedHitsCSSClasses;
  templates: RelatedHitsTemplates;
  items: any[];
};

const RelatedHits = ({ cssClasses, templates, items }: RelatedHitsProps) => {
  return (
    <Template
      templateKey="default"
      templates={templates}
      rootProps={{ className: cssClasses.root }}
      data={{ items }}
    />
  );
};

export default RelatedHits;
