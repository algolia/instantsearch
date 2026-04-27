import { hitsPerPage } from 'instantsearch.js/es/widgets';

import { useWidget } from '../../hooks/useWidget';

export function WidgetHitsPerPage() {
  const ref = useWidget((el) =>
    hitsPerPage({
      container: el,
      items: [
        { label: '3 hits per page', value: 3 },
        { label: '6 hits per page', value: 6 },
        { label: '9 hits per page', value: 9, default: true },
      ],
    })
  );
  return <div ref={ref} />;
}
