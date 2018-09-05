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
import suit from '../mixins/suit';
import { createPanelProviderMixin } from '../mixins/panel';

export default {
  mixins: [suit, createPanelProviderMixin()],
  data() {
    return {
      widgetName: 'Panel',
    };
  },
};
</script>
