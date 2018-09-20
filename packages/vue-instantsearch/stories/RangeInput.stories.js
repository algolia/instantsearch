import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

import VueSlider from 'vue-slider-component';

import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.css';
import Vue from 'vue';
Vue.use(Vuetify);

storiesOf('RangeInput', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
      <ais-range-input attribute="price" />
    `,
  }))
  .add('with precision', () => ({
    template: `
      <ais-range-input attribute="price" :precision="3" />
    `,
  }))
  .add('with min', () => ({
    template: `
      <ais-range-input attribute="price" :min="10" />
    `,
  }))
  .add('with max', () => ({
    template: `
      <ais-range-input attribute="price" :max="40" />
    `,
  }))
  .add('with min and max', () => ({
    template: `
      <ais-range-input attribute="price" :min="10" :max="50" />
    `,
  }))
  .add('with a custom render', () => ({
    template: `
      <ais-range-input attribute="price">
        <template slot-scope="{ refine, currentRefinements }">
          <form  @submit.prevent="refine(min, max)" >
            <label>
              <input
                type="number"
                :max="this.max"
                :placeholder="this.max"
                :value="currentRefinements && currentRefinements[0]"
                @change="min = $event.currentTarget.value"
              />
            </label>
            <span>to</span>
            <label >
              <input
                type="number"
                :max="this.max"
                :placeholder="this.max"
                :value="currentRefinements && currentRefinements[1]"
                @change="max = $event.currentTarget.value"
              />
            </label>
            <button type="submit">Go</button>
          </form>
        </template>
      </ais-range-input>
    `,
    data() {
      return {
        min: undefined,
        max: undefined,
      };
    },
  }))
  .add('with vue-slider-component', () => ({
    template: `
      <ais-range-input attribute="price">
        <template slot-scope="{ refine, currentRefinements, range }">
          <vue-slider
            :min="range.min"
            :max="range.max"
            :value="toValue(currentRefinements, range)"
            @input="refine($event[0], $event[1])"
          />
        </template>
      </ais-range-input>
    `,
    methods: {
      toValue([min, max], range) {
        return [
          min === -Infinity ? range.min : min,
          max === Infinity ? range.max : max,
        ];
      },
    },
    components: { VueSlider },
  }))
  .add('with vuetify slider', () => ({
    template: `
      <v-app>
        <ais-range-input attribute="price">
          <template slot-scope="{ refine, currentRefinements, range }">
            <v-range-slider
              :min="range.min"
              :max="range.max"
              :value="toValue(currentRefinements, range)"
              @input="refine($event[0], $event[1])"
            />
          </template>
        </ais-range-input>
      </v-app>
    `,
    data() {
      return {
        price: [5, 20],
      };
    },
    methods: {
      toValue([min, max], range) {
        return [
          min === -Infinity ? range.min : min,
          max === Infinity ? range.max : max,
        ];
      },
    },
    // components: {
    //   VRangeSlider,
    // },
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template slot="header">Range Input</template>
        <ais-range-input attribute="price" />
        <template slot="footer">Footer</template>
      </ais-panel>
    `,
  }));
