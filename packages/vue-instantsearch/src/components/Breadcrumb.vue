<template>
  <div
    v-if="state"
    :class="[suit(), !state.canRefine && suit('', 'noRefinement')]"
  >
    <slot
      :items="state.items"
      :can-refine="state.canRefine"
      :refine="state.refine"
      :createURL="state.createURL"
    >
      <ul :class="suit('list')">
        <li :class="[suit('item'), !state.items.length && suit('item', 'selected')]">
          <a
            v-if="Boolean(state.items.length)"
            :href="state.createURL()"
            :class="suit('link')"
            @click.prevent="state.refine()"
          >
            <slot name="rootLabel">Home</slot>
          </a>
          <span v-else>
            <slot name="rootLabel">Home</slot>
          </span>
        </li>
        <li
          v-for="(item, index) in state.items"
          :key="item.label"
          :class="[suit('item'), isLastItem(index) && suit('item', 'selected')]"
        >
          <span
            :class="suit('separator')"
            aria-hidden="true"
          >
            <slot name="separator">></slot>
          </span>
          <a
            v-if="!isLastItem(index)"
            :href="state.createURL(item.value)"
            :class="suit('link')"
            @click.prevent="state.refine(item.value)"
          >{{ item.label }}</a>
          <span v-else>{{ item.label }}</span>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script>
import { connectBreadcrumb } from 'instantsearch.js/es/connectors';
import { createPanelConsumerMixin } from '../mixins/panel';
import { createSuitMixin } from '../mixins/suit';
import { createWidgetMixin } from '../mixins/widget';

export default {
  name: 'AisBreadcrumb',
  mixins: [
    createWidgetMixin({ connector: connectBreadcrumb }),
    createPanelConsumerMixin({
      mapStateToCanRefine: state => state.canRefine,
    }),
    createSuitMixin({ name: 'Breadcrumb' }),
  ],
  props: {
    attributes: {
      type: Array,
      required: true,
    },
    separator: {
      type: String,
      default: ' > ',
    },
    rootPath: {
      type: String,
      default: null,
    },
    transformItems: {
      type: Function,
      default(items) {
        return items;
      },
    },
  },
  computed: {
    widgetParams() {
      return {
        attributes: this.attributes,
        separator: this.separator,
        rootPath: this.rootPath,
        transformItems: this.transformItems,
      };
    },
  },
  methods: {
    isLastItem(index) {
      return this.state.items.length - 1 === index;
    },
  },
};
</script>
