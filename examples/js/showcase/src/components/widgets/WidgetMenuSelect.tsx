import { menuSelect } from 'instantsearch.js/es/widgets';

import { useWidget } from '../../hooks/useWidget';

export function WidgetMenuSelect() {
  const ref = useWidget((el) =>
    menuSelect({ container: el, attribute: 'brand' })
  );
  return (
    <div>
      <h4 class="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Brands
      </h4>
      <div ref={ref} />
    </div>
  );
}
