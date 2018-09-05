<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot
      :items="state.items"
      :refine="state.refine"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style="display: none;"
      >
        <symbol
          :id="suit('starSymbol')"
          viewBox="0 0 24 24"
        >
          <path d="M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z" />
        </symbol>
        <symbol
          :id="suit('starEmptySymbol')"
          viewBox="0 0 24 24"
        >
          <path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z" />
        </symbol>
      </svg>

      <ul :class="suit('list')">
        <li
          v-for="(item, key) in state.items"
          :key="key"
          :class="[suit('item'), item.isRefined && suit('item', 'selected')]"
        >
          <a
            href="#"
            :aria-label="`${item.value} & Up`"
            :class="suit('link')"
            @click.prevent="toggleRefinement(item.value)"
          >
            <template v-for="n in max">
              <svg
                v-if="n <= item.value"
                aria-hidden="true"
                width="24"
                height="24"
                :class="[suit('starIcon'), suit('starIcon--full')]"
                :key="n"
              >
                <use :xlink:href="`#${suit('starSymbol')}`" />
              </svg>

              <svg
                v-else
                :class="[suit('starIcon'), suit('starIcon--empty')]"
                aria-hidden="true"
                width="24"
                height="24"
                :key="n"
              >
                <use :xlink:href="`#${suit('starEmptySymbol')}`" />
              </svg>
            </template>

            <span
              :class="suit('label')"
              aria-hidden="true"
            >
              &amp; Up
            </span>
            <span :class="suit('count')">
              {{ item.count }}
            </span>
          </a>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script>
import { connectStarRating } from 'instantsearch.js/es/connectors';
import { createPanelConsumerMixin } from '../mixins/panel';
import algoliaComponent from '../mixins/component';

export default {
  mixins: [
    algoliaComponent,
    createPanelConsumerMixin({
      mapStateToCanRefine: state => !state.hasNoResults,
    }),
  ],
  props: {
    attribute: {
      type: String,
      required: true,
    },
    min: {
      type: Number,
      default: 1,
    },
    max: {
      type: Number,
      default: 5,
    },
  },
  data() {
    return {
      widgetName: 'RatingMenu',
    };
  },
  beforeCreate() {
    this.connector = connectStarRating;
  },
  computed: {
    widgetParams() {
      return {
        attributeName: this.attribute,
        min: this.min,
        max: this.max,
      };
    },
  },
  methods: {
    toggleRefinement(value) {
      this.state.refine(value);
    },
  },
};
</script>
