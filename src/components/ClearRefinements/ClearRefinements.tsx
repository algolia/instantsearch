/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';
import Template from '../Template/Template.js';
import type { ClearRefinementsRenderState } from '../../connectors/clear-refinements/connectClearRefinements.js';
import type {
  ClearRefinementsCSSClasses,
  ClearRefinementsTemplates,
} from '../../widgets/clear-refinements/clear-refinements.js';
import type { ComponentCSSClasses } from '../../types/index.js';
import type { PreparedTemplateProps } from '../../lib/utils/prepareTemplateProps.js';

export type ClearRefinementsComponentCSSClasses =
  ComponentCSSClasses<ClearRefinementsCSSClasses>;

export type ClearRefinementsComponentTemplates =
  Required<ClearRefinementsTemplates>;

export type ClearRefinementsProps = {
  refine: ClearRefinementsRenderState['refine'];
  cssClasses: ClearRefinementsComponentCSSClasses;
  hasRefinements: ClearRefinementsRenderState['hasRefinements'];
  templateProps: PreparedTemplateProps<ClearRefinementsComponentTemplates>;
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
