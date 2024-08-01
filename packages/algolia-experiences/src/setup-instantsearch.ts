import algoliasearch from 'algoliasearch/lite';
import InstantSearch from 'instantsearch.js/es/lib/InstantSearch';
import { getPropertyByPath } from 'instantsearch.js/es/lib/utils';
import { index, panel } from 'instantsearch.js/es/widgets';

import { fakeFetchConfiguration } from './fake-configuration';
import { widgets } from './widgets';

import type {
  Child,
  Configuration,
  PanelWidget,
  PanelWidgetTypes,
  TemplateChild,
  TemplateText,
  TemplateWidgetTypes,
} from './types';
import type { Widget } from 'instantsearch.js';

// @TODO: hook up to some way it can be set runtime, maybe query params
const VERBOSE = true;

declare global {
  interface Window {
    __search: InstantSearch;
  }
}

export function setupInstantSearch() {
  try {
    const settings = getSettings();

    const searchClient = algoliasearch(settings.appId, settings.apiKey);
    const search = new InstantSearch({
      searchClient,
    });
    window.__search = search;

    const elements = getElements();

    injectStyles();

    fakeFetchConfiguration([...elements.keys()]).then((configuration) => {
      search
        .addWidgets(
          configuration.flatMap((config) => configToIndex(config, elements))
        )
        .start();
    });
  } catch (err) {
    error((err as Error).message);
  }
}

function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .ais-Columns {
      display: grid;
      grid-template-columns: minmax(min-content, 200px) 1fr;
      gap: 1em;
    }
  `;
  document.head.appendChild(style);
}

function getSettings(): { appId: string; apiKey: string } {
  const metaConfiguration = document.querySelector<HTMLMetaElement>(
    'meta[name="instantsearch-configuration"]'
  );

  if (!metaConfiguration || !metaConfiguration.content) {
    throw new Error('No meta tag found');
  }

  const { appId, apiKey } = JSON.parse(metaConfiguration.content);

  if (!appId || !apiKey) {
    throw new Error('Missing appId or apiKey in the meta tag');
  }

  return { appId, apiKey };
}

function getElements() {
  const elements = new Map<string, HTMLElement>();
  document
    .querySelectorAll<HTMLElement>('[data-instantsearch-id]')
    .forEach((element) => {
      const id = element.dataset.instantsearchId!;
      elements.set(id, element);
    });

  return elements;
}

function configToIndex(
  config: Configuration,
  elements: Map<string, HTMLElement>
) {
  const container = elements.get(config.id);
  if (!container) {
    error(`Element with id ${config.id} not found`);
    return [];
  }

  return [
    index({
      indexName: config.indexName,
      indexId: config.id,
    }).addWidgets(
      config.children.flatMap((child) => childToWidget(child, container))
    ),
  ];
}

const hitWidgets = new Set<TemplateWidgetTypes>([
  'ais.hits',
  'ais.infiniteHits',
  'ais.frequentlyBoughtTogether',
  'ais.lookingSimilar',
  'ais.relatedProducts',
  'ais.trendingItems',
]);
function isTemplateWidget(
  child: Child
): child is Child & { children: TemplateChild[] } {
  return hitWidgets.has(child.type as any);
}

const panelWidgets = new Set<PanelWidgetTypes>(['ais.refinementList']);
function isPanelWidget(child: Child): child is PanelWidget {
  return panelWidgets.has(child.type as any);
}

const textChildrenObject = {
  paragraph: 'p',
  div: 'div',
  span: 'span',
  h2: 'h2',
};
const textChildren = new Map(Object.entries(textChildrenObject));

type TextChildType = keyof typeof textChildrenObject;
function isTextChild(child: TemplateChild): child is TemplateChild & {
  type: TextChildType;
} {
  return textChildren.has(child.type as any);
}

function renderText(text: TemplateText[number], hit: any, components: any) {
  if (text.type === 'string') {
    return text.value;
  }

  if (text.type === 'attribute') {
    return getPropertyByPath(hit, text.path);
  }

  if (text.type === 'highlight') {
    return components.Highlight({
      hit,
      attribute: text.path,
    });
  }

  if (text.type === 'snippet') {
    return components.Snippet({
      hit,
      attribute: text.path,
    });
  }

  return null;
}

function renderAttribute(text: TemplateText[number], hit: any) {
  if (text.type === 'string') {
    return text.value;
  }

  if (text.type === 'attribute') {
    return getPropertyByPath(hit, text.path);
  }

  return null;
}

function childToWidget(child: Child, container: HTMLElement): Widget[] {
  const widgetContainer = container.appendChild(document.createElement('div'));

  if (child.type === 'columns') {
    widgetContainer.classList.add('ais-Columns');

    return child.children
      .map((column) => {
        const columnContainer = widgetContainer.appendChild(
          Object.assign(document.createElement('div'), {
            className: 'ais-Column',
          })
        );
        return column.map((ch) => childToWidget(ch, columnContainer));
      })
      .flat(2);
  }

  if (child.type === 'ais.configure') {
    return [widgets[child.type]({ ...child.parameters })];
  }

  if (isTemplateWidget(child)) {
    // type cast is needed here because the spread adding `container` and `templates` loses the type discriminant
    const parameters = child.parameters as Parameters<
      typeof widgets['ais.hits']
    >[0];
    const widget = widgets[child.type] as typeof widgets['ais.hits'];

    return [
      widget({
        ...parameters,
        container: widgetContainer,
        templates: {
          item: (hit: any, { html, components }) => {
            if (!child.children.length) {
              return html`<code> no item template given</code>`;
            }

            return child.children.map((ch) => {
              if (isTextChild(ch)) {
                const Tag = textChildren.get(ch.type)!;
                return html`<${Tag}>
                    ${ch.parameters.text.map((text) =>
                      renderText(text, hit, components)
                    )}
                  </${Tag}>`;
              }

              if (ch.type === 'image') {
                return html`<img
                  src="${ch.parameters.src
                    .map((src) => renderAttribute(src, hit))
                    .join('')}"
                  alt="${ch.parameters.alt
                    .map((alt) => renderAttribute(alt, hit))
                    .join('')}"
                />`;
              }

              return html``;
            });
          },
        },
      }),
    ];
  }

  if (isPanelWidget(child)) {
    // type cast is needed here because the spread adding `container` loses the type discriminant
    const {
      header,
      collapsed: defaultCollapsed,
      ...parameters
    } = child.parameters as Parameters<
      typeof widgets['ais.refinementList']
    >[0] & { header: string; collapsed: boolean };
    const widget = widgets[child.type] as typeof widgets['ais.refinementList'];
    return [
      panel<typeof widgets['ais.refinementList']>({
        templates: {
          header,
          collapseButtonText: ({ collapsed }, { html }) =>
            // @TODO: put this style in a stylesheet
            html`<span style="cursor: pointer">${collapsed ? '+' : '-'}</span>`,
        },
        collapsed:
          typeof defaultCollapsed === 'undefined'
            ? undefined
            : () => defaultCollapsed,
      })(widget)({
        ...parameters,
        container: widgetContainer,
      }),
    ];
  }

  // type cast is needed here because the spread adding `container` loses the type discriminant
  const parameters = child.parameters as Parameters<
    typeof widgets['ais.pagination']
  >[0];
  const widget = widgets[child.type] as typeof widgets['ais.pagination'];
  return [
    widget({
      ...parameters,
      container: widgetContainer,
    }),
  ];
}

function error(message: string) {
  if (VERBOSE) {
    // eslint-disable-next-line no-console
    console.error(`[InstantSearch] ${message}`);
  }
}
