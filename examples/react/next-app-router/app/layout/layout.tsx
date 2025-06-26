import React from 'react';

import { Wrapper } from './Wrapper';

export default function WrapperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Wrapper>{children}</Wrapper>;
}
