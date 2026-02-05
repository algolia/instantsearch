'use client';

import { useParams } from 'next/navigation';

import { warn } from './warn';

import type { InstantSearchNextInstance } from './InstantSearchNext';

let lastParams: ReturnType<typeof useParams> | null = null;

export function useDynamicRouteWarning({
  isServer,
  isMounting,
  instance,
}: {
  isServer: boolean;
  isMounting: React.RefObject<boolean>;
  instance?: InstantSearchNextInstance;
}) {
  const params = useParams();

  if (!isServer && isMounting.current && !instance) {
    // Warn if lastParams and current params have the same keys but different values
    if (
      lastParams &&
      Object.keys(lastParams).length === Object.keys(params).length &&
      Object.entries(lastParams).some(([key, value]) => params[key] !== value)
    ) {
      warn(
        false,
        `
We detected you may be using \`<InstantSearchNext>\` on a dynamic route.

This can lead to unexpected behavior, we recommend passing an \`instance\` prop to <InstantSearchNext>, created from the \`createInstantSearchNextInstance\` function.

This message can be safely ignored if you are not using dynamic routes.

For more information, see https://www.algolia.com/doc/guides/building-search-ui/going-further/server-side-rendering/react/#dynamic-routes
`
      );
    }

    lastParams = params;
  }
}
