<template>
  <div :class="[suit(''), !canRefine && suit('', 'noRefinement')]">
    <div
      v-if="$slots.header"
      :class="suit('header')"
    >
      <slot name="header" />
    </div>
    <div class="ais-Panel-body">
      <slot />
    </div>
    <div
      v-if="$slots.footer"
      :class="suit('footer')"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
import suit from '../suit';
import { createPanelProviderMixin } from '../panel';

export default {
  mixins: [createPanelProviderMixin()],
  data() {
    return {
      widgetName: 'Panel',
    };
  },
  methods: {
    suit(...args) {
      return suit(this.widgetName, ...args);
    },
  },
};
</script>
