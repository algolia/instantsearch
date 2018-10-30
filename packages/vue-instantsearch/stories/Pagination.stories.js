import { storiesOf } from '@storybook/vue';
import { previewWrapper } from './utils';

storiesOf('ais-pagination', module)
  .addDecorator(previewWrapper())
  .add('default', () => ({
    template: `
      <ais-pagination />
    `,
  }))
  .add('with a padding', () => ({
    template: `
      <ais-pagination :padding="1" />
    `,
  }))
  .add('with a total pages', () => ({
    template: `
      <ais-pagination :total-pages="5" />
    `,
  }))
  .add('complete custom rendering', () => ({
    template: `
      <ais-pagination
        :padding="5"
        style="font-family: Fira Code, sans-serif"
      >
        <template
          slot-scope="{
            pages,
            refine,
            currentRefinement
          }"
        >
          <button
            v-for="page in pages"
            @click="refine(page)"
            :style="{
              color: currentRefinement === page ? 'red' : 'unset'
            }"
          >
            {{page + 1}}
          </button>
        </template>
      </ais-pagination>`,
  }))
  .add('with named slots', () => ({
    template: `
      <ais-pagination :padding="5">
        <template slot="first" slot-scope="{ refine, isFirstPage }">
          <button
            @click="refine"
            :disabled="isFirstPage"
          >
            first
          </button>
        </template>
        <template slot="previous" slot-scope="{ refine, isFirstPage }">
          <button
            @click="refine"
            :disabled="isFirstPage"
          >
            previous
          </button>
        </template>
        </template>
        <template slot="item" slot-scope="{ page, refine, createURL }">
          <a
            class="ais-Pagination-link"
            :href="createURL()"
            @click.prevent="refine"
          >
            {{page}}
          </a>
        </template>
        <template slot="next" slot-scope="{ refine, isFirstPage }">
          <button
            @click="refine"
            :disabled="isLastPage"
          >
            next
          </button>
        </template>
        <template slot="last" slot-scope="{ refine, isFirstPage }">
          <button
            @click="refine"
            :disabled="isLastPage"
          >
            last
          </button>
        </template>
      </ais-pagination>`,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template slot="header">Pagination</template>
        <ais-pagination />
        <template slot="footer">Footer</template>
      </ais-panel>
    `,
  }));
