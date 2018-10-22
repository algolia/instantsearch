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
        <input
          placeholder="Custom SearchBox"
          slot-scope="{ currentRefinement, refine }"
          :value="currentRefinement"
          @input="refine($event.currentTarget.value)"
        />
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
        <template slot="header">SearchBox</template>
        <ais-search-box />
        <template slot="footer">Footer</template>
      </ais-panel>
    `,
  }));
