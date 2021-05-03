/** @jsx h */

import { h } from 'preact';
import {
  ToggleRefinementRenderState,
  ToggleRefinementValue,
} from '../../connectors/toggle-refinement/connectToggleRefinement';
import { PreparedTemplateProps } from '../../lib/utils/prepareTemplateProps';
import {
  ToggleRefinementTemplates,
  ToggleRefinementComponentCSSClasses,
} from '../../widgets/toggle-refinement/toggle-refinement';

import Template from '../Template/Template';
export type ToggleRefinementProps = {
  currentRefinement: ToggleRefinementValue;
  refine: ToggleRefinementRenderState['refine'];
  cssClasses: ToggleRefinementComponentCSSClasses;
  templateProps: PreparedTemplateProps<ToggleRefinementTemplates>;
};

const ToggleRefinement = ({
  currentRefinement,
  refine,
  cssClasses,
  templateProps,
}: ToggleRefinementProps) => (
  <div className={cssClasses.root}>
    <label className={cssClasses.label}>
      <input
        className={cssClasses.checkbox}
        type="checkbox"
        checked={currentRefinement.isRefined}
        onChange={event =>
          refine({ isRefined: !(event.target as HTMLInputElement).checked })
        }
      />

      <Template
        {...templateProps}
        rootTagName="span"
        rootProps={{ className: cssClasses.labelText }}
        templateKey="labelText"
        data={currentRefinement}
      />
    </label>
  </div>
);

export default ToggleRefinement;
