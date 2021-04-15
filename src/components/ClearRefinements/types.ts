import { ClearRefinementsRenderState } from '../../connectors/clear-refinements/connectClearRefinements';
import {
  ClearRefinementsCSSClasses,
  ClearRefinementsTemplates,
} from '../../widgets/clear-refinements/clear-refinements';

export type ClearRefinementsProps = {
  refine: ClearRefinementsRenderState['refine'];
  cssClasses: ClearRefinementsCSSClasses;
  hasRefinements: ClearRefinementsRenderState['hasRefinements'];
  templateProps: {
    [key: string]: any;
    templates: ClearRefinementsTemplates;
  };
};
