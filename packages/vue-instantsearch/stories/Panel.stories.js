import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-panel', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
      <ais-panel>
        <template v-slot:header>Brand</template>
        This is the body of the Panel.
        <template v-slot:footer>Footer</template>
      </ais-panel>
    `,
  }))
  .add('text content', () => ({
    template: `
      <ais-panel>
        This is the body of the Panel.
      </ais-panel>
    `,
  }))
  .add('with header', () => ({
    template: `
      <ais-panel>
        <template v-slot:header>Header</template>
        This is the body of the Panel.
      </ais-panel>
    `,
  }))
  .add('with footer', () => ({
    template: `
      <ais-panel>
        This is the body of the Panel.
        <template v-slot:footer>Footer</template>
      </ais-panel>
    `,
  }))
  .add('with header & footer', () => ({
    template: `
      <ais-panel>
        <template v-slot:header>Header</template>
        This is the body of the Panel.
        <template v-slot:footer>Footer</template>
      </ais-panel>
    `,
  }));
