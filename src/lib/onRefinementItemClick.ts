import { isSpecialClick } from './utils';

interface RefinementItem {
  isRefined: boolean;
}

/**
 * Triggers the refine function when a refinement item is clicked.
 *
 * This function handles many clicks cases because users can create their own
 * DOM with custom templates.
 */
export function onRefinementItemClick<TItem extends RefinementItem>(
  item: TItem,
  event: MouseEvent,
  refine: (item: TItem) => void
) {
  if (isSpecialClick(event)) {
    // Do not alter the default browser behavior if a special key is held
    return;
  }

  const target = event.target as HTMLElement;

  if (
    item.isRefined &&
    target.parentNode!.querySelector('input[type="radio"]:checked')
  ) {
    // Prevent refinement from being reset if users click on an already checked
    // radio button
    return;
  }

  if (target.tagName === 'INPUT') {
    refine(item);
    return;
  }

  let parent = target;

  // Click events on the following DOM tree results in two click events instead
  // of one:
  //
  // label
  //   ├─ input
  //   └─ input
  //
  // See https://www.google.com/search?q=click+label+twice
  //
  // It makes it hard to distinguish between checking/unchecking because click
  // events are very close. Debouncing would be a solution but is hacky.
  // We instead check if the click was done on or in a `label`.
  // If the `label` contains a checkbox, we ignore the first click event
  // because we will receive another one.
  while (parent !== event.currentTarget) {
    if (
      parent.tagName === 'LABEL' &&
      (parent.querySelector('input[type="checkbox"]') ||
        parent.querySelector('input[type="radio"]'))
    ) {
      return;
    }

    if (parent.tagName === 'A' && (parent as HTMLLinkElement).href) {
      // Prevent the default browser behavior because we already handle the
      // URL history
      event.preventDefault();
    }

    parent = parent.parentNode as HTMLElement;
  }

  // Stop the propagation of the event to avoid multi-level refinement lists
  // to refining twice: clicking on a child would also click its parent.
  event.stopPropagation();

  refine(item);
}
