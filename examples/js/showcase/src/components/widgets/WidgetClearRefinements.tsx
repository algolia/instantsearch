import { clearRefinements } from 'instantsearch.js';

import { useWidget } from '../../hooks/useWidget';

export function WidgetClearRefinements() {
  const ref = useWidget((el) => clearRefinements({ container: el }));
  return <div ref={ref} />;
}
