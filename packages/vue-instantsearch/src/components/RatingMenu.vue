<template>
  <div
    v-if="state"
    :class="suit()"
  >
    <slot
      :items="state.items"
      :refine="state.refine"
      :createURL="state.createURL"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style="display: none;"
      >
        <symbol
          id="ais-RatingMenu-starSymbol"
          viewBox="0 0 24 24"
        >
          <path d="M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z" />
        </symbol>
        <symbol
          id="ais-RatingMenu-starEmptySymbol"
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
            :href="state.createURL(item)"
            :aria-label="`${item.value} & Up`"
            :class="suit('link')"
            @click.prevent="state.refine(item.value)"
          >
            <template v-for="(full, n) in item.stars">
              <svg
                v-if="full"
                aria-hidden="true"
                width="24"
                height="24"
                :class="[suit('starIcon'), suit('starIcon--full')]"
                :key="n"
              >
                <use xlink:href="#ais-RatingMenu-starSymbol" />
              </svg>

              <svg
                v-else
                :class="[suit('starIcon'), suit('starIcon--empty')]"
                aria-hidden="true"
                width="24"
                height="24"
                :key="n"
              >
                <use xlink:href="#ais-RatingMenu-starEmptySymbol" />
              </svg>
            </template>

            <span
              :class="suit('label')"
              aria-hidden="true"
            >
              <slot name="andUp">&amp; Up</slot>
            </span>
            <span :class="suit('count')">{{ item.count }}</span>
          </a>
        </li>
      </ul>
    </slot>
  </div>
</template>

<script>
import { connectRatingMenu } from 'instantsearch.js/es/connectors';
import { createPanelConsumerMixin } from '../mixins/panel';
import { createWidgetMixin } from '../mixins/widget';
import { createSuitMixin } from '../mixins/suit';

export default {
  name: 'AisRatingMenu',
  mixins: [
    createSuitMixin({ name: 'RatingMenu' }),
    createWidgetMixin({ connector: connectRatingMenu }),
    createPanelConsumerMixin({
      mapStateToCanRefine: state => !state.hasNoResults,
    }),
  ],
  props: {
    attribute: {
      type: String,
      required: true,
    },
    max: {
      type: Number,
      default: 5,
    },
  },
  computed: {
    widgetParams() {
      return {
        attribute: this.attribute,
        max: this.max,
      };
    },
  },
};
</script>
