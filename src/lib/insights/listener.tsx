/** @jsx h */

import { h } from 'preact';
import { deserializePayload } from '../utils';
import { readDataAttributes, hasDataAttributes } from '../../helpers/insights';
import { InsightsClientWrapper } from '../../types';
import { InsightsEvent } from '../../middlewares/createInsightsMiddleware';

type WithInsightsListenerProps = {
  [key: string]: unknown;
  insights: InsightsClientWrapper;
  sendEvent?: (event: InsightsEvent) => void;
};

const findInsightsTarget = (
  startElement: HTMLElement | null,
  endElement: HTMLElement | null,
  validator: (element: HTMLElement) => boolean
): HTMLElement | null => {
  let element: HTMLElement | null = startElement;
  while (element && !validator(element)) {
    if (element === endElement) {
      return null;
    }
    element = element.parentElement;
  }
  return element;
};

type ParseInsightsEvent = (element: HTMLElement) => InsightsEvent;

const parseInsightsEvent: ParseInsightsEvent = element => {
  const serializedPayload = element.getAttribute('data-insights-event');

  if (typeof serializedPayload !== 'string') {
    throw new Error(
      'The insights middleware expects `data-insights-event` to be a base64-encoded JSON string.'
    );
  }

  try {
    return deserializePayload(serializedPayload) as InsightsEvent;
  } catch (error) {
    throw new Error(
      'The insights middleware was unable to parse `data-insights-event`.'
    );
  }
};

const insightsListener = (BaseComponent: any) => {
  function WithInsightsListener(props: WithInsightsListenerProps) {
    const handleClick = (event: MouseEvent): void => {
      if (props.sendEvent) {
        // new way with insights middleware
        const targetWithEvent = findInsightsTarget(
          event.target as HTMLElement | null,
          event.currentTarget as HTMLElement | null,
          element => element.hasAttribute('data-insights-event')
        );
        if (targetWithEvent) {
          const payload = parseInsightsEvent(targetWithEvent);
          props.sendEvent(payload);
        }
      }

      // old way, e.g. instantsearch.insights("clickedObjectIDsAfterSearch", { .. })
      const insightsTarget = findInsightsTarget(
        event.target as HTMLElement | null,
        event.currentTarget as HTMLElement | null,
        element => hasDataAttributes(element)
      );
      if (insightsTarget) {
        const { method, payload } = readDataAttributes(insightsTarget);
        props.insights(method, payload);
      }
    };

    return (
      <div onClick={handleClick}>
        <BaseComponent {...props} />
      </div>
    );
  }

  return WithInsightsListener;
};

export default insightsListener;
