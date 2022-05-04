import { useEffect, useState } from 'react';

import { dequal } from '../lib/dequal';

export function useStableValue<TValue>(value: TValue) {
  const [stableValue, setStableValue] = useState<TValue>(() => value);

  useEffect(() => {
    if (!dequal(stableValue, value)) {
      setStableValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return stableValue;
}
