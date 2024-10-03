/** @jsx h */
import { getPropertyByPath } from 'instantsearch.js/es/lib/utils';
import { index, panel } from 'instantsearch.js/es/widgets';
import { h, Fragment } from 'preact';

import { banner } from './banner';
import { widgets } from './widgets';

import type {
  Block,
  Configuration,
  PanelWidget,
  PanelWidgetTypes,
  TemplateAttribute,
  TemplateChild,
  TemplateText,
  TemplateWidgetTypes,
} from './types';
import type { Widget } from 'instantsearch.js';
import type { ComponentChildren, JSX } from 'preact';

export function injectStyles() {
  const style = document.createElement('style');
  style.dataset.source = 'instantsearch';

  // @TODO: decide if this should be for all columns or only a specific type
  style.textContent = `
    .ais-Grid {
      display: grid;
      grid-template-columns: minmax(min-content, 200px) 1fr;
      gap: 1em;
    }
  `;
  document.head.appendChild(style);
}

export function configToIndex(config: Configuration, container: HTMLElement) {
  return [
    index({
      indexName: config.indexName,
      indexId: config.id,
    }).addWidgets(
      config.blocks.flatMap((block) => blockToWidget(block, container))
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
  child: Block
): child is Block & { children: TemplateChild[] } {
  return hitWidgets.has(child.type as any);
}

const panelWidgets = new Set<PanelWidgetTypes>([
  'ais.refinementList',
  'ais.menu',
  'ais.hierarchicalMenu',
  'ais.breadcrumb',
  'ais.numericMenu',
  'ais.rangeInput',
  'ais.rangeSlider',
  'ais.ratingMenu',
  'ais.toggleRefinement',
]);
function isPanelWidget(child: Block): child is PanelWidget {
  return panelWidgets.has(child.type as any);
}

const tagNames = new Map<string, string>(
  Object.entries({
    paragraph: 'p',
    span: 'span',
    h2: 'h2',
    div: 'div',
    link: 'a',
    image: 'img',
  })
);

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

function renderAttribute(text: TemplateAttribute[number], hit: any) {
  if (text.type === 'string') {
    return text.value;
  }

  if (text.type === 'attribute') {
    return getPropertyByPath(hit, text.path);
  }

  return null;
}

function blockToWidget(child: Block, container: HTMLElement): Widget[] {
  if (child.type === 'ais.configure') {
    return [widgets[child.type]({ ...child.parameters })];
  }

  const widgetContainer = container.appendChild(document.createElement('div'));

  if (child.type === 'grid') {
    widgetContainer.classList.add('ais-Grid');

    return child.children
      .map((column) => {
        return blockToWidget(column, widgetContainer);
      })
      .flat(1);
  }

  if (child.type === 'column') {
    widgetContainer.classList.add('ais-Column');

    return child.children
      .map((column) => {
        return blockToWidget(column, widgetContainer);
      })
      .flat(1);
  }

  if (child.type === 'banner') {
    return [
      banner({
        container: widgetContainer,
        data: child.parameters,
      }),
    ];
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
          banner: () => null,
          item: (hit: any, { components }) => {
            if (!child.children.length) {
              return <code> no item template given</code>;
            }

            function renderChild(ch: TemplateChild) {
              const Tag = tagNames.get(ch.type) as keyof JSX.IntrinsicElements;
              if (!Tag) {
                return <Fragment></Fragment>;
              }

              let children: ComponentChildren = null;
              if ('text' in ch.parameters) {
                children = ch.parameters.text.map((text) =>
                  renderText(text, hit, components)
                );
              } else if ('children' in ch) {
                children = ch.children.map(renderChild);
              }

              const attributes = Object.fromEntries(
                Object.entries(ch.parameters)
                  .filter(
                    (tuple): tuple is [string, TemplateAttribute] =>
                      tuple[0] !== 'text'
                  )
                  .map(([key, value]) => [
                    key,
                    value.map((item) => renderAttribute(item, hit)).join(''),
                  ])
              );

              return <Tag {...attributes}>{children}</Tag>;
            }

            return child.children.map(renderChild);
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
          header: () => header,
          collapseButtonText: ({ collapsed }) => (
            // @TODO: put this style in a stylesheet
            <span style="cursor: pointer">{collapsed ? '+' : '-'}</span>
          ),
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
