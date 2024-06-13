/** @jsx h */

import { Fragment, h } from 'preact';

import connectPage from '../../connectors/page/connectPage';
import { component } from '../../lib/suit';
import {
  createDocumentationMessageGenerator,
  getContainerNode,
  getWidgetName,
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
  'ais.hits': (widgetParams: HitsWidgetParams) => {
    return hits(widgetParams);
  },
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
    cssClasses: userCssClasses = {},
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
    ({ blocks }, isFirstRender) => {
      if (isFirstRender) {
        userContainer.appendChild(rootContainer);
      }

      const widgets = getWidgetsFromBlocks(blocks);

      widgets.forEach((widget) => {
        if (!containers.has(widget.$$name)) {
          return;
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
    widgets: connectorWidgets,
  });

  return {
    // ...makeWidget({ id, path }),
    ...widget,
    init(initOptions) {
      const { blocks } =
        initOptions.renderState[initOptions.parent.getIndexId()].page;

      const widgets = getWidgetsFromBlocks(blocks);

      widgets.forEach((cb) => {
        const container = createContainer(rootContainer);

        const childWidget = cb(container);
        const attribute = getWidgetName(childWidget);

        containers.set(attribute, container);
        connectorWidgets.push(childWidget);
      });

      widget.init!(initOptions);
    },
    $$widgetType: 'ais.page',
  };
};

function getWidgetsFromBlocks(blocks: PageNode[]) {
  const widgets = blocks
    .map((block) => {
      const { type, params, children } = block;

      if (type.substring(0, 4) === 'ais.') {
        function widget(container: HTMLElement) {
          const component = components[type];
          let templates = undefined;

          if (type === 'ais.hits') {
            templates = {
              item: (hit) => {
                return (
                  <Fragment>
                    {children.map((child) => {
                      const SubComponent = components[child.type];

                      const subComponentParams = Object.fromEntries(
                        Object.entries(child.params).map(([key, value]) => {
                          return [
                            key,
                            value.startsWith('hit.')
                              ? hit[value.replace('hit.', '')]
                              : value,
                          ];
                        })
                      );

                      return <SubComponent {...subComponentParams} />;
                    })}
                  </Fragment>
                );
              },
            };
          }

          const componentParams = {
            container,
            templates,
            ...params,
          };

          if (!componentParams.templates) {
            delete componentParams.templates;
          }

          return component(componentParams);
        }

        widget.$$name = type;

        return widget;
      }

      return null;
    })
    .filter(Boolean);

  return widgets as Array<(container: HTMLElement) => Widget>;
}

function renderHitsItemTemplate(children: PageNode[], hit: any) {
  return (
    <Fragment>
      {children.map((child) => {
        const hasChildren = Array.isArray(child.children);
        const SubComponent = components[child.type];

        const subComponentParams = Object.fromEntries(
          Object.entries(child.params).map(([key, value]) => {
            const actualKey = key === 'value' ? 'children' : key;

            return [
              actualKey,
              value.startsWith('hit.') ? hit[value.replace('hit.', '')] : value,
            ];
          })
        );

        let children = null;

        if (hasChildren) {
          console.log('here');

          children = renderHitsItemTemplate(child.children, hit);
        }

        return <SubComponent {...subComponentParams}>{children}</SubComponent>;
      })}
    </Fragment>
  );
}

export default page;
