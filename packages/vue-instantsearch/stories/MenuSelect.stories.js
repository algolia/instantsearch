import { previewWrapper } from './utils';
import { storiesOf } from '@storybook/vue';

storiesOf('MenuSelect', module)
  .addDecorator(previewWrapper)
  .add('simple usage', () => ({
    template: '<ais-menu-select attribute="brand" />',
  }))
  .add('with a limit', () => ({
    template: `
      <ais-menu-select
        attribute="brand"
        :limit="5"
      />
    `,
  }))
  .add('custom sort', () => ({
    template: `
      <ais-menu-select
        attribute="brand"
        :sort-by="['name:desc']"
      />
    `,
  }))
  .add('custom label', () => ({
    template: `
      <ais-menu-select
        attribute="brand"
        label="None"
      />
    `,
  }))
  .add('custom rendering', () => ({
    template: `
      <ais-menu-select attribute="brand">
        <select
          slot-scope="{ items, canRefine, refine }"
          @change="refine($event.currentTarget.value)"
          :disabled="!canRefine"
        >
          <option value="">
            All
          </option>
          <option
            v-for="item in items"
            :key="item.value"
            :value="item.value"
            :selected="item.isRefined"
          >
            {{item.label}}
          </option>
        </select>
      </ais-menu-select>
    `,
  }));
