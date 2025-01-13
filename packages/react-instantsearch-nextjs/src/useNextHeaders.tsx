import { headers } from 'next/headers';
import { use } from 'react';

function isPromise(obj: any) {
  return (
    obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}

type Headers = Awaited<ReturnType<typeof headers>> | undefined;

export const useNextHeaders = () => {
  const isServer = typeof window === 'undefined';

  let h: Headers;

  if (isServer) {
    const nextHeaders = headers();
    if (isPromise(headers())) {
      h = use(nextHeaders);
    } else {
      h = nextHeaders as unknown as Headers; // assert that headers come from the synchronous nextjs function
    }
  }

  return h;
};
