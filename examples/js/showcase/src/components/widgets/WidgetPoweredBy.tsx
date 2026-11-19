import { poweredBy } from 'instantsearch.js';

import { useWidget } from '../../hooks/useWidget';

export function WidgetPoweredBy() {
  const ref = useWidget((el) => poweredBy({ container: el }));
  return <div ref={ref} />;
}
