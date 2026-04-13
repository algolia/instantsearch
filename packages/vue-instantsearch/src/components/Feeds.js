import { connectFeeds } from 'instantsearch.js/es/connectors/index.umd';
import { createFeedContainer } from 'instantsearch.js/es/connectors/feeds/FeedContainer';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';
import { isVue3, renderCompat, getScopedSlot } from '../util/vue-compat';

const AisFeedProvider = {
  name: 'AisFeedProvider',
  props: {
    feedContainer: {
      type: Object,
      required: true,
    },
  },
  provide() {
    return {
      $_ais_getParentIndex: () => this.feedContainer,
    };
  },
  render: renderCompat(function(h) {
    const defaultSlot = getScopedSlot(this, 'default');
    return h('div', {}, defaultSlot ? defaultSlot() : []);
  }),
};

export default {
  name: 'AisFeeds',
  mixins: [
    createWidgetMixin(
      {
        connector: connectFeeds,
      },
      {
        $$widgetType: 'ais.feeds',
      }
    ),
    createSuitMixin({ name: 'Feeds' }),
  ],
  props: {
    searchScope: {
      type: String,
      required: true,
    },
    transformFeeds: {
      type: Function,
      default: undefined,
    },
  },
  data() {
    return {
      feedContainers: new Map(),
      _removalTimer: null,
      _pendingRemovals: [],
    };
  },
  watch: {
    state(newState) {
      if (!newState) return;
      this.reconcileContainers(newState.feedIDs || []);
    },
  },
  [isVue3 ? 'beforeUnmount' : 'beforeDestroy']() {
    if (this._removalTimer !== null) {
      clearTimeout(this._removalTimer);
      this._removalTimer = null;
    }

    const toRemove = Array.from(
      new Set([...this.feedContainers.values(), ...this._pendingRemovals])
    );
    this._pendingRemovals = [];
    this.feedContainers.clear();
    if (toRemove.length > 0) {
      this.getParentIndex().removeWidgets(toRemove);
    }
  },
  methods: {
    reconcileContainers(feedIDs) {
      const parentIndex = this.getParentIndex();
      const activeFeedIDs = new Set(feedIDs);

      // Remove disappeared feeds (deferred)
      const toRemove = [];
      this.feedContainers.forEach((container, id) => {
        if (!activeFeedIDs.has(id)) {
          toRemove.push(container);
          this.feedContainers.delete(id);
        }
      });
      if (toRemove.length > 0) {
        this._pendingRemovals.push(...toRemove);

        if (this._removalTimer !== null) {
          clearTimeout(this._removalTimer);
        }

        this._removalTimer = setTimeout(() => {
          const widgetsToRemove = this._pendingRemovals;
          this._pendingRemovals = [];
          this._removalTimer = null;

          if (widgetsToRemove.length > 0) {
            parentIndex.removeWidgets(widgetsToRemove);
          }
        }, 0);
      }

      // Create new FeedContainers (synchronous — must be registered before render)
      const toAdd = [];
      feedIDs.forEach(feedID => {
        if (!this.feedContainers.has(feedID)) {
          const container = createFeedContainer(
            feedID,
            parentIndex,
            this.instantSearchInstance
          );
          this.feedContainers.set(feedID, container);
          toAdd.push(container);
        }
      });
      if (toAdd.length > 0) {
        parentIndex.addWidgets(toAdd);
      }
    },
  },
  render: renderCompat(function(h) {
    if (!this.state) {
      return h('div', { class: [this.suit()] });
    }

    const feedIDs = this.state.feedIDs || [];
    const defaultSlot = getScopedSlot(this, 'default');

    const children = feedIDs.map(feedID => {
      const container = this.feedContainers.get(feedID);
      if (!container || !defaultSlot) {
        return null;
      }

      const slotContent = defaultSlot({ feedID });

      return h(
        AisFeedProvider,
        isVue3
          ? {
              key: feedID,
              feedContainer: container,
              scopedSlots: {
                default: () => slotContent,
              },
            }
          : { key: feedID, props: { feedContainer: container } },
        slotContent
      );
    });

    return h('div', { class: [this.suit()] }, children);
  }),
  computed: {
    widgetParams() {
      return {
        searchScope: this.searchScope,
        transformFeeds: this.transformFeeds,
      };
    },
  },
};
