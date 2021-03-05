import { InsightsClientMethod, InsightsClientPayload } from '../types';
import { warning, serializePayload, deserializePayload } from '../lib/utils';

export function readDataAttributes(
  domElement: HTMLElement
): {
  method: InsightsClientMethod;
  payload: Partial<InsightsClientPayload>;
} {
  const method = domElement.getAttribute(
    'data-insights-method'
  ) as InsightsClientMethod;

  const serializedPayload = domElement.getAttribute('data-insights-payload');

  if (typeof serializedPayload !== 'string') {
    throw new Error(
      'The insights helper expects `data-insights-payload` to be a base64-encoded JSON string.'
    );
  }

  try {
    const payload: Partial<InsightsClientPayload> = deserializePayload(
      serializedPayload
    );
    return { method, payload };
  } catch (error) {
    throw new Error(
      'The insights helper was unable to parse `data-insights-payload`.'
    );
  }
}

export function hasDataAttributes(domElement: HTMLElement): boolean {
  return domElement.hasAttribute('data-insights-method');
}

export function writeDataAttributes({
  method,
  payload,
}: {
  method: InsightsClientMethod;
  payload: Partial<InsightsClientPayload>;
}): string {
  if (typeof payload !== 'object') {
    throw new Error(`The insights helper expects the payload to be an object.`);
  }

  let serializedPayload: string;

  try {
    serializedPayload = serializePayload(payload);
  } catch (error) {
    throw new Error(`Could not JSON serialize the payload object.`);
  }

  return `data-insights-method="${method}" data-insights-payload="${serializedPayload}"`;
}

/**
 * @deprecated This function will be still supported in 4.x releases, but not further. It is replaced by the `insights` middleware. For more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/
 */
export default function insights(
  method: InsightsClientMethod,
  payload: Partial<InsightsClientPayload>
): string {
  warning(
    false,
    `\`insights\` function has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the \`insights\` middleware.

For more information, visit https://www.algolia.com/doc/guides/getting-insights-and-analytics/search-analytics/click-through-and-conversions/how-to/send-click-and-conversion-events-with-instantsearch/js/`
  );
  return writeDataAttributes({ method, payload });
}
