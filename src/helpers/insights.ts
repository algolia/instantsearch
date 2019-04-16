import { InsightsClientMethod, InsightsClientPayload } from '../types';

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
    const payload: Partial<InsightsClientPayload> = JSON.parse(
      atob(serializedPayload)
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
    serializedPayload = btoa(JSON.stringify(payload));
  } catch (error) {
    throw new Error(`Could not JSON serialize the payload object.`);
  }

  return `data-insights-method="${method}" data-insights-payload="${serializedPayload}"`;
}

export default function insights(
  method: InsightsClientMethod,
  payload: Partial<InsightsClientPayload>
): string {
  return writeDataAttributes({ method, payload });
}
