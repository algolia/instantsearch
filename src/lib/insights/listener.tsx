/** @jsx h */

import { h } from 'preact';
import { readDataAttributes, hasDataAttributes } from '../../helpers/insights';
import { InsightsClientWrapper } from '../../types';

type WithInsightsListenerProps = {
  [key: string]: unknown;
  insights: InsightsClientWrapper;
};

const insightsListener = (BaseComponent: any) => {
  function WithInsightsListener(props: WithInsightsListenerProps) {
    const handleClick = (event: MouseEvent): void => {
      if (!hasDataAttributes(event.target as HTMLElement)) {
        return;
      }

      if (!props.insights) {
        throw new Error(
          'The `insightsClient` option has not been provided to `instantsearch`.'
        );
      }

      const { method, payload } = readDataAttributes(
        event.target as HTMLElement
      );

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
