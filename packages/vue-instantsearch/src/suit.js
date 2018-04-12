export default function suit(widgetName, element, subElement) {
  if (!widgetName) {
    throw new Error('You need to provide `widgetName` in your data');
  }

  if (element) {
    const scoppedWidgetName = `ais-${widgetName}-${element}`;
    // output `ais-Widget-Xyz--abc`
    if (subElement) return `${scoppedWidgetName}--${subElement}`;
    // output `ais-Widget-Xyz`
    return scoppedWidgetName;
  } else {
    // output `ais-Widget`
    return `ais-${widgetName}`;
  }
}