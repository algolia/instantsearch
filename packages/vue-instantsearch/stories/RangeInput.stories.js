import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

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
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template slot="header">Range Input</template>
        <ais-range-input attribute="price" />
        <template slot="footer">Footer</template>
      </ais-panel>
    `,
  }));
