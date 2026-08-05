import { hierarchicalMenu } from 'instantsearch.js/es/widgets';

import { useWidget } from '../../hooks/useWidget';

export function WidgetHierarchicalMenu() {
  const ref = useWidget((el) =>
    hierarchicalMenu({
      container: el,
      attributes: [
        'hierarchicalCategories.lvl0',
        'hierarchicalCategories.lvl1',
        'hierarchicalCategories.lvl2',
      ],
    })
  );
  return (
    <div>
      <h4 class="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Categories
      </h4>
      <div ref={ref} />
    </div>
  );
}
