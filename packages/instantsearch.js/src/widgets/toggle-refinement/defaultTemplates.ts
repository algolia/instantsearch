import type { ToggleRefinementTemplates } from './toggle-refinement';

const defaultTemplates: Required<ToggleRefinementTemplates> = {
  labelText({ name }) {
    return name;
  },
};

export default defaultTemplates;
