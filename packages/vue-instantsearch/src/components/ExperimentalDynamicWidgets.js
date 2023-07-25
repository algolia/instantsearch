import { warn } from '../util/warn';

import AisDynamicWidgets from './DynamicWidgets';

// @MAJOR remove this file
export default Object.assign({}, AisDynamicWidgets, {
  name: 'AisExperimentalDynamicWidgets',
  mounted() {
    warn('Use AisDynamicWidgets instead of AisExperimentalDynamicWidgets.');
  },
});
