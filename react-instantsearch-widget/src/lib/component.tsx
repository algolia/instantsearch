import React from 'react';

import type { ProvidedProps } from './connector'

type Props = ProvidedProps & {
  refine: () => void;
};

export const Component = ({}: Props) => {
  return (
    <div>
      {/* TODO: render something */}
    </div>
  );
};
