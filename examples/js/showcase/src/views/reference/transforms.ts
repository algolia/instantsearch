/**
 * Shared `transformItems` helpers. Generic over the item shape so the same
 * helper works for every widget whose items carry a label.
 *
 * A searchable widget renders `highlighted` rather than `label`, so a
 * transform that touches only `label` would be invisible there.
 */
interface LabelledItem {
  label: string;
  highlighted?: string;
}

// `highlighted` contains `__ais-highlight__` placeholders that must be kept
// as-is, so only the text between them is transformed.
function mapHighlightedText(
  highlighted: string | undefined,
  fn: (text: string) => string
) {
  return highlighted
    ?.split(/(__\/?ais-highlight__)/)
    .map((part, index) => (index % 2 === 0 ? fn(part) : part))
    .join('');
}

export function uppercaseLabels<TItem extends LabelledItem>(
  items: TItem[]
): TItem[] {
  return items.map((item) => ({
    ...item,
    label: item.label.toUpperCase(),
    highlighted: mapHighlightedText(item.highlighted, (text) =>
      text.toUpperCase()
    ),
  }));
}

export function lowercaseLabels<TItem extends LabelledItem>(
  items: TItem[]
): TItem[] {
  return items.map((item) => ({
    ...item,
    label: item.label.toLowerCase(),
    highlighted: mapHighlightedText(item.highlighted, (text) =>
      text.toLowerCase()
    ),
  }));
}
