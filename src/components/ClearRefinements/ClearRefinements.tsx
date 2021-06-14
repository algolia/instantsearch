/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';
import Template from '../Template/Template';
import { ClearRefinementsRenderState } from '../../connectors/clear-refinements/connectClearRefinements';
import {
  ClearRefinementsCSSClasses,
  ClearRefinementsTemplates,
} from '../../widgets/clear-refinements/clear-refinements';
import { ComponentCSSClasses } from '../../types';

export type ClearRefinementsComponentCSSClasses = ComponentCSSClasses<
  ClearRefinementsCSSClasses
>;

export type ClearRefinementsProps = {
  refine: ClearRefinementsRenderState['refine'];
  cssClasses: ClearRefinementsComponentCSSClasses;
  hasRefinements: ClearRefinementsRenderState['hasRefinements'];
  templateProps: {
    [key: string]: any;
    templates: ClearRefinementsTemplates;
  };
};

const ClearRefinements = ({
  hasRefinements,
  refine,
  cssClasses,
  templateProps,
}: ClearRefinementsProps) => (
  <div className={cssClasses.root}>
    <Template
      {...templateProps}
      templateKey="resetLabel"
      rootTagName="button"
      rootProps={{
        className: cx(cssClasses.button, {
          [cssClasses.disabledButton]: !hasRefinements,
        }),
        onClick: refine,
        disabled: !hasRefinements,
      }}
      data={{ hasRefinements }}
    />
  </div>
);

export default ClearRefinements;
