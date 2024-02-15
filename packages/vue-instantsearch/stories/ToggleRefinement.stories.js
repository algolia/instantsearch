import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-toggle-refinement', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
      <ais-toggle-refinement
        attribute="free_shipping"
        label="Free Shipping"
      />
    `,
  }))
  .add('with an on value', () => ({
    template: `
      <ais-toggle-refinement
        attribute="free_shipping"
        label="Free Shipping"
        :on="true"
      />
    `,
  }))
  .add('with an on value (with multiple values)', () => ({
    template: `
      <ais-toggle-refinement
        attribute="brand"
        label="Metra or Samsung"
        :on="['Samsung', 'Metra']"
      />
    `,
  }))
  .add('with an off value', () => ({
    template: `
      <ais-toggle-refinement
        attribute="free_shipping"
        label="Free Shipping"
        :off="false"
      />
    `,
  }))
  .add('with a custom render', () => ({
    template: `
      <ais-toggle-refinement
        attribute="free_shipping"
        label="Free Shipping"
      >
        <template v-slot="{ value, refine, createURL }">
          <a :href="createURL()" @click.prevent="refine(value)">
            <span>{{ value.name }}</span>
            <span>{{ value.isRefined ? '(is enabled)' : '(is disabled)' }}</span>
          </a>
        </template>
      </ais-toggle-refinement>
    `,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template v-slot:header>Toggle Refinement</template>
        <ais-toggle-refinement
          attribute="free_shipping"
          label="Free Shipping"
        />
        <template v-slot:footer>Footer</template>
      </ais-panel>
    `,
  }));
