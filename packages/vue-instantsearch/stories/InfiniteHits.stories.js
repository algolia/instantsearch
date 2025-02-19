import { storiesOf } from '@storybook/vue';
import { createInfiniteHitsSessionStorageCache } from 'instantsearch.js/es/lib/infiniteHitsCache';
import { simple } from 'instantsearch.js/es/lib/stateMappings';

import { MemoryRouter } from './MemoryRouter';
import { previewWrapper } from './utils';

storiesOf('ais-infinite-hits', module)
  .addDecorator(previewWrapper())
  .add('simple usage', () => ({
    template: `<ais-infinite-hits />`,
  }))
  .add('with transform items', () => ({
    template: `
      <ais-infinite-hits :transform-items="transformItems">
        <template v-slot:item="{ item, index }">
          <div>
            {{item.name}} - {{index}}
          </div>
        </template>
      </ais-infinite-hits>
    `,
    methods: {
      transformItems(items) {
        return items.map((item) =>
          Object.assign({}, item, {
            name: item.name.toUpperCase(),
          })
        );
      },
    },
  }))
  .add('with a custom render', () => ({
    template: `
      <ais-infinite-hits>
        <template v-slot="{ items, isLastPage, refine }">
          <div>
            <div
              v-for="(item, index) in items"
              :key="item.objectID"
            >
              {{item.name}}
            </div>

            <button
              :disabled="isLastPage"
              @click="refine"
            >
              Load more
            </button>
          </div>
        </template>
      </ais-infinite-hits>
    `,
  }))
  .add('with a custom item render', () => ({
    template: `
      <ais-infinite-hits>
        <template v-slot:item="{ item, index }">
          <div>
            {{item.name}} - {{index}}
          </div>
        </template>
      </ais-infinite-hits>
    `,
  }))
  .add('with a custom show more render', () => ({
    template: `
      <ais-infinite-hits>
        <template v-slot:loadMore="{ refine, page, isLastPage }">
          <div>
            <button
              :disabled="isLastPage"
              @click="refine"
            >
              Gimme {{ isLastPage ? "nothing anymore" : "page " + (page + 2) }}!
            </button>
          </div>
        </template>
      </ais-infinite-hits>
    `,
  }))
  .add('with a disabled button', () => ({
    template: `
      <div>
        <ais-configure query="dsdsds" />
        <ais-infinite-hits />
      </div>
    `,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template v-slot:header>Infinite Hits</template>
        <ais-infinite-hits />
        <template v-slot:footer>Footer</template>
      </ais-panel>
    `,
  }));

storiesOf('ais-infinite-hits', module)
  .addDecorator(
    previewWrapper({
      routing: {
        router: new MemoryRouter({ page: 3 }),
        stateMapping: simple(),
      },
    })
  )
  .add('with show previous enabled', () => ({
    template: `
      <ais-infinite-hits :show-previous="true"></ais-infinite-hits>`,
  }));

storiesOf('ais-infinite-hits', module)
  .addDecorator(
    previewWrapper({
      routing: {
        router: new MemoryRouter({ page: 3 }),
        stateMapping: simple(),
      },
    })
  )
  .add('with a custom show previous render', () => ({
    template: `
      <ais-infinite-hits :show-previous="true">
        <template v-slot:loadPrevious="{ refinePrevious, isFirstPage }">
          <div>
            <button
              :disabled="isFirstPage"
              @click="refinePrevious"
            >
              Gimme {{ isFirstPage ? "nothing anymore" : "previous page" }}!
            </button>
          </div>
        </template>
      </ais-infinite-hits>`,
  }));

storiesOf('ais-infinite-hits', module)
  .addDecorator(previewWrapper({}))
  .add('with insights on default slot', () => ({
    template: `
      <div>
        <ais-configure :clickAnalytics="true" />
        <ais-infinite-hits>
          <template v-slot="{ items, refine, isLastPage, insights }">
            <div>
              <div
                v-for="item in items"
                :key="item.objectID"
              >
                custom objectID: {{item.objectID}}
                <button @click="insights('clickedObjectIDsAfterSearch', { eventName: 'Add to cart', objectIDs: [item.objectID] })">Add to cart</button>
              </div>
              <button
                :disabled="isLastPage"
                @click="refine"
              >
                Load more
              </button>
            </div>
          </template>
        </ais-infinite-hits>
      </div>
    `,
  }))
  .add('with insights on item slot', () => ({
    template: `
      <div>
        <ais-configure :clickAnalytics="true" />
        <ais-infinite-hits>
          <template v-slot:item="{ item, insights }">
            <div>
              custom objectID: {{item.objectID}}
              <button @click="insights('clickedObjectIDsAfterSearch', { eventName: 'Add to cart', objectIDs: [item.objectID] })">Add to cart</button>
            </div>
          </template>
        </ais-infinite-hits>
      </div>
    `,
  }))
  .add('with sessionStorage cache enabled', () => ({
    template: `
      <ais-infinite-hits :cache="cache">
        <template v-slot:item="{ item, insights }">
          <div>
            custom objectID: {{item.objectID}}
            <a href="https://google.com">Go to the detail</a>
          </div>
        </template>
      </ais-infinite-hits>
    `,
    data: () => ({
      cache: createInfiniteHitsSessionStorageCache(),
    }),
  }));
