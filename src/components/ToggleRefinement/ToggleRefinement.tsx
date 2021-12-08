/** @jsx h */

import { h } from 'preact';
import type {
  ToggleRefinementRenderState,
  ToggleRefinementValue,
} from '../../connectors/toggle-refinement/connectToggleRefinement.js';
import type { PreparedTemplateProps } from '../../lib/utils/prepareTemplateProps.js';
import type { ComponentCSSClasses } from '../../types/index.js';
import type {
  ToggleRefinementTemplates,
  ToggleRefinementCSSClasses,
} from '../../widgets/toggle-refinement/toggle-refinement.js';

import Template from '../Template/Template.js';

export type ToggleRefinementComponentCSSClasses =
  ComponentCSSClasses<ToggleRefinementCSSClasses>;

export type ToggleRefinementComponentTemplates =
  Required<ToggleRefinementTemplates>;

export type ToggleRefinementProps = {
  currentRefinement: ToggleRefinementValue;
  refine: ToggleRefinementRenderState['refine'];
  cssClasses: ToggleRefinementComponentCSSClasses;
  templateProps: PreparedTemplateProps<ToggleRefinementComponentTemplates>;
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
        onChange={(event) =>
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
