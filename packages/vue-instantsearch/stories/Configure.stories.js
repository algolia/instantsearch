import { withKnobs, object } from '@storybook/addon-knobs/vue';
import { storiesOf } from '@storybook/vue';

import { previewWrapper } from './utils';

storiesOf('ais-configure', module)
  .addDecorator(
    previewWrapper({
      filters: '<ais-refinement-list attribute="brand" />',
    })
  )
  .addDecorator(withKnobs)
  .add('default', () => ({
    template: `
      <ais-configure />
    `,
  }))
  .add('with 1 hit per page', () => ({
    template: `
      <ais-configure :hitsPerPage="1" />
    `,
  }))
  .add('with 1 hit per page (kebab)', () => ({
    template: `
      <ais-configure :hits-per-page.camel="1" />
    `,
  }))
  .add('external toggler', () => ({
    template: `
      <div>
        <ais-configure :hitsPerPage="hitsPerPage" />
        <button @click="toggleHitsPerPage">hitsPerPage: {{hitsPerPage}}, change</button>
      </div>
    `,
    data() {
      return { hitsPerPage: 1 };
    },
    methods: {
      toggleHitsPerPage() {
        this.hitsPerPage = this.hitsPerPage === 1 ? 5 : 1;
      },
    },
  }))
  .add('inline toggler', () => ({
    template: `
      <ais-configure :hitsPerPage="1" :analytics="false">
        <template v-slot="{ searchParameters, refine }">
          <pre>{{JSON.stringify(searchParameters, null, 2)}}</pre>
          <button @click="refine({hitsPerPage: searchParameters.hitsPerPage === 1 ? 5 : 1})">
            hitsPerPage: {{searchParameters.hitsPerPage}}, change
          </button>
        </template>
      </ais-configure>
    `,
  }))
  .add('with display of the parameters', () => ({
    template: `
      <ais-configure :hitsPerPage="1">
        <template v-slot="{ searchParameters }">
          <pre>{{ searchParameters }}</pre>
        </template>
      </ais-configure>
    `,
  }))
  .add('merging parameters', () => ({
    template: `
    <ais-configure :enableRules="false" :hitsPerPage="5">
      <template v-slot="{ searchParameters, refine }">
        <button
          @click="refine(
            Object.assign(
              {},
              searchParameters,
              { enableRules: !searchParameters.enableRules }
            )
          )"
        >
          toggle only query rules
        </button>
        currently applied filters: <pre>{{searchParameters}}</pre>
      </template>
    </ais-configure>
    `,
  }))
  .add('playground', () => ({
    template: `
      <ais-configure v-bind="knobs">
        <template v-slot="{ searchParameters }">
          <pre>{{ searchParameters }}</pre>
        </template>
      </ais-configure>
    `,
    data() {
      return {
        knobs: object('search parameters', {
          hitsPerPage: 1,
        }),
      };
    },
  }));
