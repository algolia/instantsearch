import React from 'preact-compat';
import { readDataAttributes, hasDataAttributes } from '../../helpers/insights';
import { InsightsClientWrapper } from '../../types';

type WithInsightsListenerProps = {
  [key: string]: unknown;
  insights: InsightsClientWrapper;
};

export default (BaseComponent: React.ComponentType<any>) => {
  function WithInsightsListener(
    props: WithInsightsListenerProps
  ): React.ReactNode {
    const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
      if (!hasDataAttributes(event.target)) {
        return;
      }
      if (!props.insights) {
        throw new Error(
          'The `insightsClient` option has not been provided to `instantsearch`.'
        );
      }
      const { method, payload } = readDataAttributes(event.target);
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
