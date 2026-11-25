type ClickEvent = {
  button: number;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
};

/**
 * Whether a click should keep its default browser behavior (open in a new
 * tab or window, download…) instead of being handled by the widget.
 */
export function isModifierClick(event: ClickEvent) {
  const isMiddleClick = event.button === 1;

  return Boolean(
    isMiddleClick ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  );
}
