/** @jsx h */

import { h, AnyComponent } from 'preact';
import { readDataAttributes, hasDataAttributes } from '../../helpers/insights';
import { InsightsClientWrapper } from '../../types';

type WithInsightsListenerProps = {
  [key: string]: unknown;
  insights: InsightsClientWrapper;
};

export default (BaseComponent: AnyComponent<any, any>) => {
  function WithInsightsListener(
    props: WithInsightsListenerProps
  ): React.ReactNode {
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
