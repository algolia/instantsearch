import type { ToggleRefinementComponentTemplates } from '../../components/ToggleRefinement/ToggleRefinement';

const defaultTemplates: ToggleRefinementComponentTemplates = {
  labelText({ name }) {
    return name;
  },
};

export default defaultTemplates;
