import { action } from '@storybook/addon-actions';
import { InsightsClient } from '../../src/types';

export const insightsClient = (((method: string, payload: any) =>
  action(`[InsightsClient] sent ${method} with payload`)(
    payload
  )) as unknown) as InsightsClient;
