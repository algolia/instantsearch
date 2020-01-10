import { createInstantSearchComponent } from '../util/createInstantSearchComponent';

export default createInstantSearchComponent({
  name: 'AisInstantSearchSsr',
  inject: {
    $_ais: {
      default() {
        throw new Error('`rootMixin` is required when using SSR.');
      },
    },
  },
  data() {
    return {
      instantSearchInstance: this.$_ais,
    };
  },
  render(createElement) {
    return createElement(
      'div',
      {
        class: {
          [this.suit()]: true,
          [this.suit('', 'ssr')]: true,
        },
      },
      this.$slots.default
    );
  },
});
