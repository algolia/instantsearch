import React from 'react';

import { responsesCache } from '../lib/client';

import Search from './Search';

export const dynamic = 'force-dynamic';

export default function Page() {
  responsesCache.clear();

  return <Search />;
}
