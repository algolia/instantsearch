// TODO(instantsearch v5): `AisAutocomplete` (`<ais-autocomplete>`) is now the full autocomplete UI, formerly `AisExperimentalAutocomplete`. The renderless slot wrapper (`refine`, `currentRefinement`, `indices`) was removed: build it with `connectAutocomplete` and `createWidgetMixin` instead. If you meant the new component, there is nothing to change.
import { AisAutocomplete, AisAutocomplete as AisExperimentalAutocomplete } from 'vue-instantsearch/vue3/es';

export default {
  components: { AisAutocomplete, AisExperimentalAutocomplete },
};

