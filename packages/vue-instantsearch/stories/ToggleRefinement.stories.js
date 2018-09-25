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
        <a
          slot-scope="{ value, refine, createURL }"
          :href="createURL()"
          @click.prevent="refine(value)"
        >
          <span>{{ value.name }}</span>
          <span>{{ value.isRefined ? '(is enabled)' : '(is disabled)' }}</span>
        </a>
      </ais-toggle-refinement>
    `,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template slot="header">Toggle Refinement</template>
        <ais-toggle-refinement
          attribute="free_shipping"
          label="Free Shipping"
        />
        <template slot="footer">Footer</template>
      </ais-panel>
    `,
  }));
