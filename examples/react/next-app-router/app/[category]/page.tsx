import React from 'react';

import { responsesCache } from '../../lib/client';

import Search from './Search';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  responsesCache.clear();

  return <Search category={category} />;
}
