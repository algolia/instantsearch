import Link from 'next/link';
import React from 'react';

// A plain page with no InstantSearch, mirroring the reproduction in #7060
// where the first soft-navigation lands on an InstantSearch page.
export const dynamic = 'force-dynamic';

export default function Landing() {
  return (
    <div>
      <h1>Landing</h1>
      <Link href="/Appliances" id="to-appliances">
        Go to Appliances
      </Link>
    </div>
  );
}
