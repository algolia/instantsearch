/* eslint-disable no-console */
import type { InternalMiddleware } from '../types';

export function createConfigurationMiddleware({
  renderTrigger = () => {},
}: {
  renderTrigger?: () => void;
}): InternalMiddleware {
  return () => {
    let isReady = false;
    return {
      $$type: 'ais.configuration',
      $$behavior: 'blocking',
      $$internal: true,
      isReady() {
        return isReady;
      },
      subscribe({ done }) {
        // Walk through widgets until "block()" to retrieve configuration
        // Send request to configuration API
        console.log('Requesting configuration...');
        setTimeout(() => {
          // Inject initial configuration results to instantSearchInstance
          // Release from blocking
          console.log('Configuration received');
          isReady = true;
          renderTrigger();
          done();
        }, 1000);
      },
      onStateChange() {},
      started() {},
      unsubscribe() {},
    };
  };
}
