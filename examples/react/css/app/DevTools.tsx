'use client';

import { useEffect } from 'react';

export function DevTools() {
  useEffect(() => {
    import('instantsearch.css/devtools/inject');
  }, []);

  return null;
}
