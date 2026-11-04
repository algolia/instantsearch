/** @jsx h */

import { readDataAttributes } from 'instantsearch-core';
import { warning } from 'instantsearch-core';
import { h } from 'preact';

import type { InsightsClient } from 'instantsearch-core';

export type InsightsEventHandlerOptions = {
  insights?: InsightsClient;
};

export const createInsightsEventHandler =
  ({ insights }: InsightsEventHandlerOptions) =>
  (event: MouseEvent): void => {
    // e.g. instantsearch.insights("clickedObjectIDsAfterSearch", { .. })
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
