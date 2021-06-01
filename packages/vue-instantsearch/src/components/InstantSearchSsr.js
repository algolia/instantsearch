import { createInstantSearchComponent } from '../util/createInstantSearchComponent';
import { isVue3, h } from 'vue-demi';

export default createInstantSearchComponent({
  name: 'AisInstantSearchSsr',
  inject: {
    $_ais_ssrInstantSearchInstance: {
      default() {
        throw new Error('`createServerRootMixin` is required when using SSR.');
      },
    },
  },
  data() {
    return {
      instantSearchInstance: this.$_ais_ssrInstantSearchInstance,
    };
  },
  render(createElement) {
    return (isVue3 ? h : createElement)(
      'div',
      {
        class: {
          [this.suit()]: true,
          [this.suit('', 'ssr')]: true,
        },
      },
      isVue3 ? this.$slots.default() : this.$slots.default
    );
  },
});
