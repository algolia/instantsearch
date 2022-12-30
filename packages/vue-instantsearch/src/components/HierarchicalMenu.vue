<template>
  <div
    v-if="state"
    :class="[suit(), !state.canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :items="state.items"
      :can-refine="state.canRefine"
      :can-toggle-show-more="state.canToggleShowMore"
      :is-showing-more="state.isShowingMore"
      :refine="state.refine"
      :createURL="state.createURL"
      :toggle-show-more="state.toggleShowMore"
      :send-event="state.sendEvent"
    >
      <hierarchical-menu-list
        :items="state.items"
        :level="0"
        :refine="state.refine"
        :createURL="state.createURL"
        :suit="suit"
      />

      <button
        v-if="showMore"
        :class="[
          suit('showMore'),
          !state.canToggleShowMore && suit('showMore', 'disabled'),
        ]"
        :disabled="!state.canToggleShowMore"
        @click.prevent="state.toggleShowMore"
      >
        <slot name="showMoreLabel" :is-showing-more="state.isShowingMore">
          {{ state.isShowingMore ? 'Show less' : 'Show more' }}
        </slot>
      </button>
    </slot>
  </div>
</template>

<script>
import { connectHierarchicalMenu } from 'instantsearch.js/es/connectors';
import { createWidgetMixin } from '../mixins/widget';
import { createPanelConsumerMixin } from '../mixins/panel';
import HierarchicalMenuList from './HierarchicalMenuList.vue';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisHierarchicalMenu',
  mixins: [
    createSuitMixin({ name: 'HierarchicalMenu' }),
    createWidgetMixin(
      {
        connector: connectHierarchicalMenu,
      },
      {
        $$widgetType: 'ais.hierarchicalMenu',
      }
    ),
    createPanelConsumerMixin(),
  ],
  components: {
    HierarchicalMenuList,
  },
  props: {
    attributes: {
      type: Array,
      required: true,
    },
    limit: {
      type: Number,
      default: undefined,
    },
    showMoreLimit: {
      type: Number,
      default: undefined,
    },
    showMore: {
      type: Boolean,
      default: false,
    },
    sortBy: {
      type: [Array, Function],
      default: undefined,
    },
    separator: {
      type: String,
      default: undefined,
    },
    rootPath: {
      type: String,
      default: undefined,
    },
    showParentLevel: {
      type: Boolean,
      default: undefined,
    },
    transformItems: {
      type: Function,
      default: undefined,
    },
  },
  computed: {
    widgetParams() {
      return {
        attributes: this.attributes,
        limit: this.limit,
        showMore: this.showMore,
        showMoreLimit: this.showMoreLimit,
        separator: this.separator,
        rootPath: this.rootPath,
        showParentLevel: this.showParentLevel,
        sortBy: this.sortBy,
        transformItems: this.transformItems,
      };
    },
  },
};
</script>
