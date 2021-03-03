import { ClearRefinementsRendererOptions } from '../../connectors/clear-refinements/connectClearRefinements';
import { ClearRefinementsCSSClasses } from '../../widgets/clear-refinements/clear-refinements';

export type ClearRefinementsProps = {
  refine: ClearRefinementsRendererOptions['refine'];
  cssClasses: ClearRefinementsCSSClasses;
  hasRefinements: ClearRefinementsRendererOptions['hasRefinements'];
  templateProps: object;
};
