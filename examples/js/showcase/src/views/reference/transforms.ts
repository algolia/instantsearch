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

export function uppercaseLabels<TItem extends LabelledItem>(
  items: TItem[]
): TItem[] {
  return items.map((item) => ({
    ...item,
    label: item.label.toUpperCase(),
    highlighted: item.highlighted?.toUpperCase(),
  }));
}

export function lowercaseLabels<TItem extends LabelledItem>(
  items: TItem[]
): TItem[] {
  return items.map((item) => ({
    ...item,
    label: item.label.toLowerCase(),
    highlighted: item.highlighted?.toLowerCase(),
  }));
}
