import { headers } from 'next/headers';
import React from 'react';

import { responsesCache } from '../lib/client';

import Search from './Search';

export const dynamic = 'force-dynamic';

export default async function Page() {
  responsesCache.clear();

  // SSR-side fetches (e.g. `<ChatPageSuggestions>`'s transport) need an
  // absolute URL because Node fetch can't resolve relative paths.
  const h = await headers();
  const host = h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${proto}://${host}`;

  return <Search baseUrl={baseUrl} />;
}
