/** @jsx h */

import { h } from 'preact';
import { readDataAttributes, hasDataAttributes } from '../../helpers/insights';
import { InsightsClientWrapper } from '../../types';

type WithInsightsListenerProps = {
  [key: string]: unknown;
  insights: InsightsClientWrapper;
};

const findInsightsTarget = (
  startElement: HTMLElement | null,
  endElement: HTMLElement | null
): HTMLElement | null => {
  let element: HTMLElement | null = startElement;
  while (element && !hasDataAttributes(element)) {
    if (element === endElement) {
      return null;
    }
    element = element.parentElement;
  }
  return element;
};

const insightsListener = (BaseComponent: any) => {
  function WithInsightsListener(props: WithInsightsListenerProps) {
    const handleClick = (event: MouseEvent): void => {
      const insightsTarget = findInsightsTarget(
        event.target as HTMLElement | null,
        event.currentTarget as HTMLElement | null
      );

      if (!insightsTarget) return;

      const { method, payload } = readDataAttributes(insightsTarget);

      props.insights(method, payload);
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
