/** @jsx h */

import { Fragment, h, render } from 'preact';

import connectPage from '../../connectors/page/connectPage';
import { component } from '../../lib/suit';
import {
  createDocumentationMessageGenerator,
  getContainerNode,
} from '../../lib/utils';
import configure from '../configure/configure';
import hits from '../hits/hits';

import type {
  PageConnectorParams,
  PageNode,
  PageWidgetDescription,
} from '../../connectors/page/connectPage';
import type { WidgetFactory, Widget } from '../../types';
import type { ConfigureWidgetParams } from '../configure/configure';
import type { HitsWidgetParams } from '../hits/hits';

export type PageCSSClasses = Partial<{
  /**
   * CSS class to add to the wrapping element.
   */
  root: string | string[];
}>;

export type PageWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * CSS classes to add.
   */
  cssClasses?: PageCSSClasses;
};

type PageWidget = WidgetFactory<
  PageWidgetDescription & { $$widgetType: 'ais.page' },
  PageConnectorParams,
  PageWidgetParams
>;

const components = {
  'ais.configure': ({ container, ...widgetParams }: ConfigureWidgetParams) =>
    configure(widgetParams),
  'ais.hits': (widgetParams: HitsWidgetParams) => hits(widgetParams),
  'heading-1': ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  'heading-2': ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  'heading-3': ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  'heading-4': ({ children, ...props }: any) => <h4 {...props}>{children}</h4>,
  'heading-5': ({ children, ...props }: any) => <h5 {...props}>{children}</h5>,
  'heading-6': ({ children, ...props }: any) => <h6 {...props}>{children}</h6>,
  paragraph: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  image: (props: any) => <img {...props} />,
  link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  text: ({ children }: any) => <Fragment>{children}</Fragment>,
};

const suit = component('Page');
const withUsage = createDocumentationMessageGenerator({ name: 'page' });

function createContainer(rootContainer: HTMLElement) {
  const container = document.createElement('div');
  container.className = suit({ descendantName: 'widget' });

  rootContainer.appendChild(container);

  return container;
}

const page: PageWidget = function page(widgetParams) {
  const {
    container: containerSelector,
    path = new URL(window.location.href).pathname.substring(1),
    ...otherWidgetParams
  } = widgetParams || {};

  if (!containerSelector) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const userContainer = getContainerNode(containerSelector);
  const rootContainer = document.createElement('div');
  rootContainer.className = suit();

  const containers = new Map<string, HTMLElement>();
  const connectorWidgets: Widget[] = [];

  const makeWidget = connectPage(
    ({ blocks, instantSearchInstance }, isFirstRender) => {
      if (isFirstRender) {
        userContainer.appendChild(rootContainer);
      }

      const widgets = getWidgetsFromBlocks(blocks, rootContainer);

      widgets.forEach((widget) => {
        if (!containers.has(widget.$$name)) {
          const container = createContainer(rootContainer);
          const childWidget = widget(container);

          containers.set(widget.$$name, container);
          connectorWidgets.push(childWidget);
          instantSearchInstance.addWidgets([childWidget]);
        }
        const container = containers.get(widget.$$name)!;
        rootContainer.appendChild(container);
      });
    },
    () => {
      userContainer.removeChild(rootContainer);
    }
  );

  const widget = makeWidget({
    ...otherWidgetParams,
    path,
    widgets: connectorWidgets,
  });

  return {
    ...widget,
    $$widgetType: 'ais.page',
  };
};

function getWidgetsFromBlocks(blocks: PageNode[], containerNode: HTMLElement) {
  const widgets = blocks
    .map((block) => {
      const { type, params, children } = block;

      if (type.substring(0, 4) !== 'ais.') {
        const widget = () => {
          const aisWidget = () => {
            return {
              init() {
                render(
                  components[type]({
                    children: renderHitsItemTemplate(children, {}),
                  }),
                  containerNode
                );
              },
              render() {
                render(
                  components[type]({
                    children: renderHitsItemTemplate(children, {}),
                  }),
                  containerNode
                );
              },
            };
          };

          return aisWidget({});
        };

        widget.$$name = type;

        return widget;
      }

      if (type.substring(0, 4) === 'ais.') {
        const widget = (container: HTMLElement) => {
          const aisWidget = components[type];
          let templates = undefined;

          if (type === 'ais.hits') {
            templates = {
              item: (hit) => {
                return (
                  <Fragment>{renderHitsItemTemplate(children, hit)}</Fragment>
                );
              },
            };
          }

          const widgetParams = {
            container,
            templates,
            ...params,
          };

          if (!widgetParams.templates) {
            delete widgetParams.templates;
          }

          return aisWidget(widgetParams);
        };

        widget.$$name = type;

        return widget;
      }

      return null;
    })
    .filter(Boolean);

  return widgets as Array<(container: HTMLElement) => Widget>;
}

function renderHitsItemTemplate(blocks: PageNode[], hit: any) {
  return (
    <Fragment>
      {blocks.map((block) => {
        const Component = components[block.type];
        let children = null;
        let params = null;

        if (block.children?.length) {
          children = renderHitsItemTemplate(block.children, hit);
        }

        if (block.params) {
          params = Object.fromEntries(
            Object.entries(block.params).map(([key, value]) => {
              const actualKey = key === 'value' ? 'children' : key;
              const actualValue = value.startsWith('hit.')
                ? hit[value.replace('hit.', '')]
                : value;

              return [actualKey, actualValue];
            })
          );
        }

        return (
          <Component {...params}>{children || params?.children}</Component>
        );
      })}
    </Fragment>
  );
}

export default page;
