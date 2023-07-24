import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-hits', module)
  .addDecorator(previewWrapper())
  .add('simple usage', () => ({
    template: `<ais-hits></ais-hits>`,
  }))
  .add('with transform items', () => ({
    template: `
      <ais-hits :transform-items="transformItems">
        <template v-slot:item="{ item }">
          <div>
            <h2>{{item.name}}</h2>
          </div>
        </template>
      </ais-hits>
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
  .add('custom rendering', () => ({
    template: `
    <ais-hits>
      <template v-slot:item="{ item }">
        <div>
          <marquee>before one</marquee>
          <h2>{{item.name}}</h2>
          <small>{{item.description}}</small>
        </div>
      </template>
    </ais-hits>
  `,
  }))
  .add('custom rendering (all)', () => ({
    template: `
    <ais-hits>
      <template v-slot="{ items }">
        <div>
          <marquee>before everything</marquee>
          <div
            v-for="item in items"
            :key="item.objectID"
          >
            custom objectID: {{item.objectID}}
          </div>
        </div>
      </template>
    </ais-hits>`,
  }))
  .add('with a Panel', () => ({
    template: `
      <ais-panel>
        <template v-slot:header>Hits</template>
        <ais-hits />
        <template v-slot:footer>Footer</template>
      </ais-panel>
    `,
  }));

storiesOf('ais-hits', module)
  .addDecorator(
    previewWrapper({
      insightsClient: (method, payload) =>
        action(`[InsightsClient] sent ${method} with payload`)(payload),
    })
  )
  .add('with insights default slot', () => ({
    template: `
      <div>
        <ais-configure :clickAnalytics="true" />
        <ais-hits>
          <template v-slot="{ items, insights }">
            <div>
              <div
                v-for="item in items"
                :key="item.objectID"
              >
                custom objectID: {{item.objectID}}
                <button @click="insights('clickedObjectIDsAfterSearch', { eventName: 'Add to cart', objectIDs: [item.objectID] })">Add to cart</button>
              </div>
            </div>
          </template>
        </ais-hits>
      </div>
    `,
  }))
  .add('with insights with item slot', () => ({
    template: `
      <div>
        <ais-configure :clickAnalytics="true" />
        <ais-hits>
          <template v-slot:item="{ item, insights }">
            <div>
              custom objectID: {{item.objectID}}
              <button @click="insights('clickedObjectIDsAfterSearch', { eventName: 'Add to cart', objectIDs: [item.objectID] })">Add to cart</button>
            </div>
          </template>
        </ais-hits>
      </div>
    `,
  }));
