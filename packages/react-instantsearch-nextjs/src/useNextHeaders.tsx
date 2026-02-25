import { use } from 'react';

type NextHeaders = {
  get: (name: string) => string | null;
  has: (name: string) => boolean;
  entries: () => IterableIterator<[string, string]>;
  keys: () => IterableIterator<string>;
  values: () => IterableIterator<string>;
  forEach: (
    callbackfn: (value: string, key: string, parent: NextHeaders) => void
  ) => void;
};

type Headers = NextHeaders | undefined;
type HeadersResult = NextHeaders | Promise<NextHeaders>;

function isPromise(obj: unknown): obj is Promise<unknown> {
  return (
    obj !== null &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof (obj as Promise<unknown>).then === 'function'
  );
}

export const useNextHeaders = (): Headers => {
  const isServer = typeof window === 'undefined';

  if (isServer) {
    // Dynamic require to avoid bundling next/headers in client components
    const nextHeadersModule = require('next/headers') as {
      headers: () => HeadersResult;
    };
    const nextHeaders = nextHeadersModule.headers();
    return isPromise(nextHeaders) ? use(nextHeaders) : nextHeaders;
  }

  return undefined;
};
