/* eslint-disable no-console */
import type { InternalMiddleware } from '../types';

type ConfigurationMiddlewareOptions = {
  renderTrigger: () => void;
};

export function createConfigurationMiddleware(
  options?: ConfigurationMiddlewareOptions
): InternalMiddleware {
  const { renderTrigger = () => {} } = options || {};

  return ({ instantSearchInstance }) => {
    return {
      $$type: 'ais.configuration',
      $$internal: true,
      // eslint-disable-next-line no-restricted-syntax
      async subscribe() {
        // Walk through widgets until "block()" to retrieve configuration
        // Send request to configuration API
        console.log('Requesting configuration...');
        await getConfigurationFromApi();
        console.log('Configuration received');
        instantSearchInstance._configuration = { foo: 'bar' };
        renderTrigger();
      },
      onStateChange() {},
      started() {},
      unsubscribe() {},
    };
  };
}

function getConfigurationFromApi() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}
