<template>
  <div :class="[suit(), !canRefine && suit('', 'noRefinement')]">
    <div v-if="getSlot('header')" :class="suit('header')">
      <slot name="header" :has-refinements="canRefine" />
    </div>
    <div :class="suit('body')">
      <slot :has-refinements="canRefine" />
    </div>
    <div v-if="getSlot('footer')" :class="suit('footer')">
      <slot name="footer" :has-refinements="canRefine" />
    </div>
  </div>
</template>

<script>
import { isVue3 } from '../util/vue-compat';
import { createPanelProviderMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisPanel',
  mixins: [createSuitMixin({ name: 'Panel' }), createPanelProviderMixin()],
  methods: {
    getSlot(name) {
      return isVue3
        ? this.$slots[name]
        : this.$slots[name] || this.$scopedSlots[name];
    },
  },
};
</script>
