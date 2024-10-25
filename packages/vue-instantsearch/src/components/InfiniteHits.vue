<template>
  <div v-if="state" :class="suit()">
    <slot
      v-if="showPrevious"
      name="loadPrevious"
      :refine-previous="refinePrevious"
      :page="state.results.page"
      :is-first-page="state.isFirstPage"
    >
      <button
        :class="[
          suit('loadPrevious'),
          state.isFirstPage && suit('loadPrevious', 'disabled'),
        ]"
        :disabled="state.isFirstPage"
        @click="refinePrevious()"
      >
        Show previous results
      </button>
    </slot>

    <slot
      :items="state.items"
      :results="state.results"
      :banner="state.banner"
      :is-last-page="state.isLastPage"
      :refine-previous="refinePrevious"
      :refine-next="refineNext"
      :refine="refineNext"
      :send-event="state.sendEvent"
    >
      <template
        v-if="showBanner && state.banner && state.banner.image.urls[0].url"
      >
        <slot name="banner" :banner="state.banner">
          <aside :class="suit('banner')">
            <a
              v-if="state.banner.link"
              :href="state.banner.link.url"
              :target="state.banner.link.target"
              :class="suit('banner-link')"
            >
              <img
                :src="state.banner.image.urls[0].url"
                :alt="state.banner.image.title"
                :class="suit('banner-image')"
              />
            </a>
            <img
              v-else
              :src="state.banner.image.urls[0].url"
              :alt="state.banner.image.title"
              :class="suit('banner-image')"
            />
          </aside>
        </slot>
      </template>
      <ol :class="suit('list')">
        <li
          v-for="(item, index) in state.items"
          :class="suit('item')"
          :key="item.objectID"
          @click="state.sendEvent('click:internal', item, 'Hit Clicked')"
          @auxclick="state.sendEvent('click:internal', item, 'Hit Clicked')"
        >
          <slot
            name="item"
            :item="item"
            :index="index"
            :send-event="state.sendEvent"
          >
            <!-- prettier-ignore -->
            <div style="word-break: break-all">{{
              defaultItemComponent(item)
            }}</div>
          </slot>
        </li>
      </ol>

      <slot
        name="loadMore"
        :refine-next="refineNext"
        :refine="refineNext"
        :page="state.results.page"
        :is-last-page="state.isLastPage"
      >
        <button
          :class="[
            suit('loadMore'),
            state.isLastPage && suit('loadMore', 'disabled'),
          ]"
          :disabled="state.isLastPage"
          @click="refineNext()"
        >
          Show more results
        </button>
      </slot>
    </slot>
  </div>
</template>

<script>
import { connectInfiniteHits } from 'instantsearch-core';

import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';

export default {
  name: 'AisInfiniteHits',
  mixins: [
    createWidgetMixin(
      {
        connector: connectInfiniteHits,
      },
      {
        $$widgetType: 'ais.infiniteHits',
      }
    ),
    createSuitMixin({ name: 'InfiniteHits' }),
  ],
  props: {
    showBanner: {
      type: Boolean,
      default: true,
    },
    showPrevious: {
      type: Boolean,
      default: false,
    },
    escapeHTML: {
      type: Boolean,
      default: true,
    },
    transformItems: {
      type: Function,
      default: undefined,
    },
    cache: {
      type: Object,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {
        showBanner: this.showBanner,
        showPrevious: this.showPrevious,
        escapeHTML: this.escapeHTML,
        transformItems: this.transformItems,
        cache: this.cache,
      };
    },
  },
  methods: {
    refinePrevious() {
      this.state.showPrevious();
    },
    refineNext() {
      this.state.showMore();
    },
    defaultItemComponent(hit) {
      return `${JSON.stringify(hit).slice(0, 100)}…`;
    },
  },
};
</script>
