/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h } from 'preact';

import Template from '../Template/Template';

import type { ClearRefinementsRenderState } from '../../connectors/clear-refinements/connectClearRefinements';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { ComponentCSSClasses } from '../../types';
import type {
  ClearRefinementsCSSClasses,
  ClearRefinementsTemplates,
} from '../../widgets/clear-refinements/clear-refinements';

export type ClearRefinementsComponentCSSClasses =
  ComponentCSSClasses<ClearRefinementsCSSClasses>;

export type ClearRefinementsComponentTemplates =
  Required<ClearRefinementsTemplates>;

export type ClearRefinementsProps = {
  refine: ClearRefinementsRenderState['refine'];
  cssClasses: ClearRefinementsComponentCSSClasses;
  canRefine: ClearRefinementsRenderState['canRefine'];
  templateProps: PreparedTemplateProps<ClearRefinementsComponentTemplates>;
};

const ClearRefinements = ({
  canRefine,
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
        className: cx(
          cssClasses.button,
          !canRefine && cssClasses.disabledButton
        ),
        onClick: refine,
        disabled: !canRefine,
      }}
      data={{ canRefine }}
    />
  </div>
);

export default ClearRefinements;
