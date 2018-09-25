import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('ais-clear-refinements', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
      <ais-clear-refinements />
    `,
  }))
  .add('with clears query', () => ({
    template: `
      <div>
        <div class="preview-spacer">
          <ais-clear-refinements :clearsQuery="true" />
        </div>

        <span>TIP: type something first</span>
      </div>
    `,
  }))
  .add('with a custom label', () => ({
    template: `
      <ais-clear-refinements>
        <template slot="resetLabel">Remove the refinements</template>
      </ais-clear-refinements>
    `,
  }))
  .add('with a custom render', () => ({
    template: `
      <ais-clear-refinements>
        <button
          slot-scope="{ canRefine, refine }"
          :disabled="!canRefine"
          @click="refine()"
        >
          Clear the search query
        </button>
      </ais-clear-refinements>
    `,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template slot="header">Clear refinements</template>
        <ais-clear-refinements :clearsQuery="true" />
        <template slot="footer">Footer</template>
      </ais-panel>
    `,
  }));
