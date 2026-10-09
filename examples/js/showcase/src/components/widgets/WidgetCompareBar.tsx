import { compareBar } from 'instantsearch.js/es/widgets';

import { useWidget } from '../../hooks/useWidget';

export function WidgetCompareBar() {
  const ref = useWidget((el) => compareBar({ container: el }));

  return (
    <div class="flex flex-col gap-3">
      <p class="text-xs text-neutral-500 dark:text-neutral-400">
        Tick "Compare" on two or three hits below. The bar docks to the bottom
        of the viewport and its Compare button opens the chat with the selected
        records attached.
      </p>
      <div ref={ref} />
    </div>
  );
}
