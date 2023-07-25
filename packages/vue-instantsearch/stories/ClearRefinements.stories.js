import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-clear-refinements', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
      <ais-clear-refinements />
    `,
  }))
  .add('also clearing query', () => ({
    template: `
      <div>
        <div class="preview-spacer">
          <ais-clear-refinements :excluded-attributes="[]" />
        </div>

        <span>TIP: type something first</span>
      </div>
    `,
  }))
  .add('not clearing "brand"', () => ({
    template: `
      <div>
        <div class="preview-spacer">
          <ais-clear-refinements :excluded-attributes="['brand']" />
          <hr />
          <ais-hierarchical-menu
            :attributes="[
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ]"
          />
          <hr />
          <ais-range-input attribute="price" />
        </div>
      </div>
    `,
  }))
  .add('with a custom label', () => ({
    template: `
      <ais-clear-refinements>
        <template v-slot:resetLabel>Remove the refinements</template>
      </ais-clear-refinements>
    `,
  }))
  .add('with a custom render', () => ({
    template: `
      <ais-clear-refinements>
        <template v-slot="{ canRefine, refine }">
          <button
            :disabled="!canRefine"
            @click="refine()"
          >
            Clear the search query
          </button>
        </template>
      </ais-clear-refinements>
    `,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template v-slot:header>Clear refinements</template>
        <ais-clear-refinements :clearsQuery="true" />
        <template v-slot:footer>Footer</template>
      </ais-panel>
    `,
  }));
