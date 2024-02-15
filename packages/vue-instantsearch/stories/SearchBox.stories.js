import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-search-box', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: '<ais-search-box></ais-search-box>',
  }))
  .add('with loading indicator', () => ({
    template: '<ais-search-box show-loading-indicator></ais-search-box>',
  }))
  .add('with autofocus', () => ({
    template: '<ais-search-box autofocus></ais-search-box>',
  }))
  .add('with custom rendering', () => ({
    template: `
      <ais-search-box autofocus>
        <template v-slot="{ currentRefinement, refine }">
          <input
            :value="currentRefinement"
            @input="refine($event.currentTarget.value)"
            placeholder="Custom SearchBox"
          />
        </template>
      </ais-search-box>
    `,
  }))
  .add('with custom rendering of icons', () => ({
    template: `
      <ais-search-box show-loading-indicator>
        <template slot="reset-icon">
          ❌
        </template>
        <template slot="submit-icon">
          🔎
        </template>
        <template slot="loading-indicator">
          🔄
        </template>
      </ais-search-box>
    `,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template v-slot:header>SearchBox</template>
        <ais-search-box />
        <template v-slot:footer>Footer</template>
      </ais-panel>
    `,
  }));
