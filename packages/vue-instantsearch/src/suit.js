export default function suit(widgetName, element, subElement) {
  if (!widgetName) {
    throw new Error('You need to provide `widgetName` in your data');
  }

  if (element) {
    const scopedWidgetName = `ais-${widgetName}-${element}`;
    // output `ais-Widget-xyz--abc`
    if (subElement) return `${scopedWidgetName}--${subElement}`;
    // output `ais-Widget-xyz`
    return scopedWidgetName;
  } else {
    // output `ais-Widget`
    return `ais-${widgetName}`;
  }
}
