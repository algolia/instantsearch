import { responsesCache } from '../../../lib/client';

import Product from './Product';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ pid: string }>;
};

export default async function Page({ params }: Props) {
  responsesCache.clear();

  const { pid } = await params;

  return <Product pid={pid} />;
}
