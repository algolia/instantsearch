<template>
  <div
    v-if="state"
    :class="[suit(), !canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :items="items"
      :can-refine="canRefine"
      :can-toggle-show-more="canToggleShowMore"
      :is-showing-more="isShowingMore"
      :refine="state.refine"
      :createURL="state.createURL"
      :toggle-show-more="toggleShowMore"
    >
      <hierarchical-menu-list
        :items="items"
        :level="0"
        :refine="state.refine"
        :createURL="state.createURL"
        :suit="suit"
      />

      <button
        v-if="showMore"
        :class="[
          suit('showMore'),
          !canToggleShowMore && suit('showMore', 'disabled')
        ]"
        :disabled="!canToggleShowMore"
        @click.prevent="toggleShowMore"
      >
        <slot
          name="showMoreLabel"
          :is-showing-more="isShowingMore"
        >{{ isShowingMore ? 'Show less' : 'Show more' }}</slot>
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

const mapStateToCanRefine = state => state.items.length > 0;

export default {
  name: 'AisHierarchicalMenu',
  mixins: [
    createSuitMixin({ name: 'HierarchicalMenu' }),
    createWidgetMixin({ connector: connectHierarchicalMenu }),
    createPanelConsumerMixin({
      mapStateToCanRefine,
    }),
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
      default: 10,
    },
    showMoreLimit: {
      type: Number,
      default: 20,
    },
    showMore: {
      type: Boolean,
      default: false,
    },
    sortBy: {
      type: [Array, Function],
      default() {
        return ['name:asc'];
      },
    },
    separator: {
      type: String,
      default: ' > ',
    },
    rootPath: {
      type: String,
      default: null,
    },
    showParentLevel: {
      type: Boolean,
      default: true,
    },
    transformItems: {
      type: Function,
      default(items) {
        return items;
      },
    },
  },
  data() {
    return {
      isShowingMore: false,
    };
  },
  computed: {
    widgetParams() {
      return {
        attributes: this.attributes,
        limit: this.showMore ? this.showMoreLimit : this.limit,
        separator: this.separator,
        rootPath: this.rootPath,
        showParentLevel: this.showParentLevel,
        sortBy: this.sortBy,
        transformItems: this.transformItems,
      };
    },
    items() {
      return this.truncate(this.state.items);
    },
    canRefine() {
      return mapStateToCanRefine(this.state);
    },
    canToggleShowMore() {
      return (
        this.isShowingMore ||
        this.state.items.length >= this.internalShowMoreLimit
      );
    },
    internalShowMoreLimit() {
      return this.isShowingMore ? this.showMoreLimit : this.limit;
    },
  },
  methods: {
    toggleShowMore() {
      this.isShowingMore = !this.isShowingMore;
    },
    truncate(items) {
      const sliced = items.slice(items, this.internalShowMoreLimit);

      return sliced.map(item =>
        Object.assign({}, item, {
          data: Array.isArray(item.data) ? this.truncate(item.data) : item.data,
        })
      );
    },
  },
};
</script>
