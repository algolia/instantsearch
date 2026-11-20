import { isSpecialClick } from 'instantsearch-core/internal';

/**
 * Decides whether a click on a list item (`<li>`) of a refinement widget
 * should refine. The JS widgets handle clicks on the item root so that custom
 * `item` templates refine without wiring any handler.
 *
 * Click events on DOM trees like LABEL > INPUT fire twice: once on the label
 * and once on the input the label activates. This guard ignores the click on
 * a label wrapping a checkbox or radio (the input's own click follows), lets
 * special clicks (modifier keys, middle click) keep their browser behavior,
 * prevents the navigation of links (the widget handles the URL), and stops
 * propagation so nested lists don't refine their parent too.
 */
export function shouldRefineFromItemClick(
  originalEvent: MouseEvent,
  isRefined: boolean
) {
  if (isSpecialClick(originalEvent)) {
    return false;
  }

  let parent = originalEvent.target as HTMLElement | null;

  if (parent === null || parent.parentNode === null) {
    return false;
  }

  if (
    isRefined &&
    parent.parentNode.querySelector('input[type="radio"]:checked')
  ) {
    // Prevent refinement for being reset if the user clicks on an already checked radio button
    return false;
  }

  if (parent.tagName === 'INPUT') {
    return true;
  }

  while (parent !== originalEvent.currentTarget) {
    if (
      parent.tagName === 'LABEL' &&
      (parent.querySelector('input[type="checkbox"]') ||
        parent.querySelector('input[type="radio"]'))
    ) {
      return false;
    }

    if (parent.tagName === 'A' && (parent as HTMLAnchorElement).href) {
      originalEvent.preventDefault();
    }

    parent = parent.parentNode as HTMLElement;
  }

  originalEvent.stopPropagation();

  return true;
}
