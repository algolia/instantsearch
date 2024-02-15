/** @jsx h */

import { h } from 'preact';

import { readDataAttributes } from '../../helpers/insights';
import { deserializePayload, warning } from '../utils';

import type { InsightsEvent } from '../../middlewares/createInsightsMiddleware';
import type { InsightsClient } from '../../types';

export type InsightsEventHandlerOptions = {
  insights?: InsightsClient;
  sendEvent: (event: InsightsEvent) => void;
};

export const createInsightsEventHandler =
  ({ insights, sendEvent }: InsightsEventHandlerOptions) =>
  (event: MouseEvent): void => {
    // new way, e.g. bindEvent("click", hit, "Hit clicked")
    const insightsThroughSendEvent = findInsightsTarget(
      event.target as HTMLElement | null,
      event.currentTarget as HTMLElement | null,
      (element) => element.hasAttribute('data-insights-event')
    );

    if (insightsThroughSendEvent) {
      const payload = parseInsightsEvent(insightsThroughSendEvent);

      payload.forEach((single) => sendEvent(single));
    }

    // old way, e.g. instantsearch.insights("clickedObjectIDsAfterSearch", { .. })
    const insightsThroughFunction = findInsightsTarget(
      event.target as HTMLElement | null,
      event.currentTarget as HTMLElement | null,
      (element) =>
        element.hasAttribute('data-insights-method') &&
        element.hasAttribute('data-insights-payload')
    );
    if (insightsThroughFunction) {
      const { method, payload } = readDataAttributes(insightsThroughFunction);
      insights!(method, payload);
    }
  };

function findInsightsTarget(
  startElement: HTMLElement | null,
  endElement: HTMLElement | null,
  validator: (element: HTMLElement) => boolean
): HTMLElement | null {
  let element: HTMLElement | null = startElement;
  while (element && !validator(element)) {
    if (element === endElement) {
      return null;
    }
    element = element.parentElement;
  }
  return element;
}

function parseInsightsEvent(element: HTMLElement): InsightsEvent[] {
  const serializedPayload = element.getAttribute('data-insights-event');

  if (typeof serializedPayload !== 'string') {
    throw new Error(
      'The insights middleware expects `data-insights-event` to be a base64-encoded JSON string.'
    );
  }

  try {
    return deserializePayload(serializedPayload);
  } catch (error) {
    throw new Error(
      'The insights middleware was unable to parse `data-insights-event`.'
    );
  }
}

/**
 * @deprecated use `sendEvent` directly instead
 */
export default function withInsightsListener(BaseComponent: any) {
  warning(
    false,
    'The `withInsightsListener` function is deprecated and will be removed in the next major version. Please use `sendEvent` directly instead.'
  );

  return function WithInsightsListener(
    props: { [key: string]: any } & InsightsEventHandlerOptions
  ) {
    const handleClick = createInsightsEventHandler(props);

    return (
      <div onClick={handleClick}>
        <BaseComponent {...props} />
      </div>
    );
  };
}
