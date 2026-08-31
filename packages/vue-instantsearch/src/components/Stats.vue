<template>
  <div v-if="state" :class="suit()">
    <slot
      v-bind="state"
      :results="state.instantSearchInstance.helper.lastResults"
    >
      <!-- prettier-ignore -->
      <span :class="suit('text')"
        ><template v-if="state.areHitsSorted"
          >{{ sortedResultsSentence }}</template
        ><template v-else>{{ resultsSentence }}</template
        > found in {{ state.processingTimeMS.toLocaleString() }}ms</span
      >
    </slot>
    <span
      :class="suit('announcement')"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      :style="visuallyHiddenStyle"
      >{{ announcement }}</span
    >
  </div>
</template>

<script>
import { connectStats } from 'instantsearch.js/es/connectors/index';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { isVue3 } from '../util/vue-compat';

// Delay before announcing an update, so that rapid changes (e.g. typing in the
// search box) settle into a single announcement instead of piling up. Mirrors
// the debounce used by GOV.UK's accessible-autocomplete.
const ANNOUNCEMENT_DELAY = 1400;

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
      visuallyHiddenStyle: {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      },
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

      clearTimeout(this.announcementTimer);
      this.announcementTimer = setTimeout(() => {
        this.announcement = next;
      }, ANNOUNCEMENT_DELAY);
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

      return this.state.areHitsSorted
        ? this.sortedResultsSentence
        : this.resultsSentence;
    },
    sortedResultsSentence() {
      const { nbHits, nbSortedHits } = this.state;

      const suffix = `sorted out of ${nbHits.toLocaleString()}`;

      if (nbSortedHits === 0) {
        return `No relevant results ${suffix}`;
      }

      if (nbSortedHits === 1) {
        return `1 relevant result ${suffix}`;
      }

      if (nbSortedHits > 1) {
        return `${(
          nbSortedHits || 0
        ).toLocaleString()} relevant results ${suffix}`;
      }

      return '';
    },
    resultsSentence() {
      const { nbHits } = this.state;

      if (nbHits === 0) {
        return 'No results';
      }

      if (nbHits === 1) {
        return '1 result';
      }

      if (nbHits > 1) {
        return `${nbHits.toLocaleString()} results`;
      }

      return '';
    },
    widgetParams() {
      return {};
    },
  },
};
</script>
