import type { Configuration } from './types';

const CONFIGURATION_OBJECT: Record<string, Configuration> = {
  qsdfqsdf: {
    id: 'qsdfqsdf',
    indexName: 'instant_search',
    children: [
      {
        type: 'searchBox',
        parameters: {},
      },
      {
        type: 'configure',
        parameters: {
          hitsPerPage: 2,
        },
      },
      {
        type: 'hits',
        parameters: {
          templates: {
            item: (hit: any, { html, components }) =>
              html`<div>
                one: ${components.Highlight({ hit, attribute: 'name' })}
              </div>`,
          },
        },
      },
    ],
  },
  'other-one': {
    id: 'other-one',
    indexName: 'instant_search',
    children: [
      {
        type: 'hits',
        parameters: {
          templates: {
            item: (hit: any, { html, components }) =>
              html`<div>
                other: ${components.Highlight({ hit, attribute: 'name' })}
              </div>`,
          },
        },
      },
      {
        type: 'pagination',
        parameters: {
          padding: 2,
        },
      },
    ],
  },
};
const CONFIGURATION_MAP = new Map<string, Configuration>(
  Object.entries(CONFIGURATION_OBJECT)
);
const FAKE_DELAY = 1000;

export function fakeFetchConfiguration(ids: string[]) {
  return new Promise((resolve) => setTimeout(resolve, FAKE_DELAY)).then(() =>
    ids.map((id) => CONFIGURATION_MAP.get(id)!).filter(Boolean)
  );
}
