import { useState } from 'react';

import { dequal } from './dequal';

export function useStableValue<TValue>(value: TValue) {
  const [stableValue, setStableValue] = useState<TValue>(() => value);

  if (!dequal(stableValue, value)) {
    setStableValue(value);
  }

  return stableValue;
}
