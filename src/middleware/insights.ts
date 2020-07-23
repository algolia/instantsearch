import { Middleware } from '.';
import { InsightsClient } from '../types';

export type InsightsProps = {
  insightsClient: InsightsClient;
};

export type CreateInsightsMiddleware = (props: InsightsProps) => Middleware;

export const createInsightsMiddleware: CreateInsightsMiddleware = props => {
  const { insightsClient } = props;
  if (!insightsClient) {
    throw new Error(
      'passing insightsClient to instantsearch is required for insightsMiddleware',
    );
  }
  return ({ instantSearchInstance }) => {
    return {
      onStateChange() {},
      subscribe() {
        instantSearchInstance.mainIndex
          .getHelper()
          .setQueryParameter('clickAnalytics', true);

        insightsClient(
          'onUserTokenChange',
          userToken => {
            instantSearchInstance.mainIndex
              .getHelper()
              .setQueryParameter('userToken', userToken);
          },
          { immediate: true }
        );
      },
      unsubscribe() {
        insightsClient('onUserTokenChange', () => {});
      },
    };
  };
};
