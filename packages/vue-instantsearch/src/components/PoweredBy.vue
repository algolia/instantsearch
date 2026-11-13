<script>
import { createPoweredByComponent } from 'instantsearch-ui-components';

import { createSuitMixin } from '../mixins/suit';
import { Fragment, renderReactCompat } from '../util/vue-compat';

export default {
  name: 'AisPoweredBy',
  mixins: [createSuitMixin({ name: 'PoweredBy' })],
  props: {
    theme: {
      default: 'light',
      validator(value) {
        return ['light', 'dark'].indexOf(value) !== -1;
      },
    },
  },
  computed: {
    algoliaUrl() {
      return (
        'https://www.algolia.com/?' +
        'utm_source=vue-instantsearch&' +
        'utm_medium=website&' +
        `utm_content=${location ? location.hostname : ''}&` +
        'utm_campaign=poweredby'
      );
    },
  },
  render: renderReactCompat(function (h) {
    const PoweredBy = createPoweredByComponent({
      createElement: h,
      Fragment,
    });

    return h(PoweredBy, {
      classNames: this.classNames && {
        root: this.classNames['ais-PoweredBy'],
        light: this.classNames['ais-PoweredBy--light'],
        dark: this.classNames['ais-PoweredBy--dark'],
        link: this.classNames['ais-PoweredBy-link'],
        logo: this.classNames['ais-PoweredBy-logo'],
      },
      url: this.algoliaUrl,
      theme: this.theme,
    });
  }),
};
</script>
