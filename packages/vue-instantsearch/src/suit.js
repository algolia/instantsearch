export default function suit(widgetName, element, modifier) {
  if (!widgetName) {
    throw new Error('You need to provide `widgetName` in your data');
  }

  const elements = [`ais-${widgetName}`];

  if (element) {
    elements.push(`-${element}`);
  }

  if (modifier) {
    elements.push(`--${modifier}`);
  }

  return elements.join('');
}
