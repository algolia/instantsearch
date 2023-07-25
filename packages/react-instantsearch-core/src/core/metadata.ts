import type { Widget } from './createWidgetsManager';
import type { SearchClient } from '../widgets/InstantSearch';

export function isMetadataEnabled() {
  return (
    typeof window === 'object' &&
    typeof window.navigator === 'object' &&
    typeof window.navigator.userAgent === 'string' &&
    window.navigator.userAgent.includes('Algolia Crawler') &&
    typeof window.document === 'object'
  );
}

export function getMetadataPayload(
  widgets: Widget[],
  searchClient: SearchClient
) {
  const internalProps = ['contextValue', 'indexContextValue'];

  const widgetsPayload = widgets.map(({ props, constructor }) => {
    const { defaultProps = {}, displayName = constructor.displayName } =
      constructor._connectorDesc || {};

    return {
      displayName,
      $$type: constructor.$$type,
      $$widgetType: constructor.$$widgetType,
      params: Object.keys(props).filter(
        (prop) =>
          !internalProps.includes(prop) &&
          defaultProps[prop] !== (props as any)[prop] &&
          (props as any)[prop] !== undefined
      ),
    };
  });

  const client = searchClient as Record<string, any>;
  const ua =
    client.transporter && client.transporter.userAgent
      ? client.transporter.userAgent.value
      : client._ua;

  return {
    ua,
    widgets: widgetsPayload,
  };
}

export function injectMetadata(widgets: Widget[], searchClient: SearchClient) {
  const payloadContainer = document.createElement('meta');
  const refNode = document.querySelector('head')!;
  payloadContainer.name = 'algolia:metadata';

  const payload = getMetadataPayload(widgets, searchClient);

  payloadContainer.content = JSON.stringify(payload);
  refNode.appendChild(payloadContainer);
}
