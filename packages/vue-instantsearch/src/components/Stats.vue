<script>
import { connectStats } from 'instantsearch-core';
import {
  STATS_ANNOUNCEMENT_DELAY,
  createStatsComponent,
  getStatsAnnouncementText,
  getStatsText,
} from 'instantsearch-ui-components';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import {
  Fragment,
  getScopedSlot,
  isVue3,
  renderReactCompat,
} from '../util/vue-compat';

export default {
  name: 'AisStats',
  mixins: [
    createWidgetMixin(
      { connector: connectStats },
      {
        $$widgetType: 'ais.stats',
      }
    ),
    createSuitMixin({ name: 'Stats' }),
  ],
  data() {
    return {
      announcement: '',
      announcementTimer: undefined,
      isInitialAnnouncement: true,
    };
  },
  [isVue3 ? 'beforeUnmount' : 'beforeDestroy']() {
    clearTimeout(this.announcementTimer);
  },
  watch: {
    announcementText(next) {
      // Don't announce the initial results, only subsequent changes.
      if (this.isInitialAnnouncement) {
        this.isInitialAnnouncement = false;
        return;
      }

      // Debounced so that rapid changes (e.g. typing in the search box)
      // settle into a single announcement instead of piling up.
      clearTimeout(this.announcementTimer);
      this.announcementTimer = setTimeout(() => {
        this.announcement = next;
      }, STATS_ANNOUNCEMENT_DELAY);
    },
  },
  computed: {
    // Result count without the volatile details (such as the processing time)
    // that are part of the visible text, so that only the meaningful count is
    // announced.
    announcementText() {
      if (!this.state) {
        return '';
      }

      return getStatsAnnouncementText(this.state);
    },
    widgetParams() {
      return {};
    },
  },
  render: renderReactCompat(function (h) {
    if (!this.state) {
      return null;
    }

    const Stats = createStatsComponent({ createElement: h, Fragment });
    const defaultSlot = getScopedSlot(this, 'default');

    return h(Stats, {
      classNames: this.classNames && {
        root: this.classNames['ais-Stats'],
        text: this.classNames['ais-Stats-text'],
        announcement: this.classNames['ais-Stats-announcement'],
      },
      text: getStatsText(this.state),
      textComponent:
        defaultSlot &&
        (() =>
          defaultSlot({
            ...this.state,
            results:
              this.state.instantSearchInstance.mainIndex.getHelper()
                .lastResults,
          })),
      announcement: this.announcement,
    });
  }),
};
</script>
