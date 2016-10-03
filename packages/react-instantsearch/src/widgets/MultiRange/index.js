import connect from './connect';
import MultiRangeComponent from './MultiRange';

/**
 * MultiRange is a widget used for selecting the range value of a numeric attribute.
 * @kind component
 * @category widget
 * @propType {string} id - widget id, defaults to the attribute name
 * @propType {string} attributeName - the name of the attribute in the records
 * @propType {{label: string, start: number, end: number}[]} items - List of options. With a text label, and upper and lower bounds.
 * @themeKey root - The root component of the widget
 * @themeKey items - The container of the items
 * @themeKey item - A single item
 * @themeKey itemSelected - The selected item
 * @themeKey itemLabel - The label of an item
 */
const MultiRange = connect(MultiRangeComponent);
MultiRange.connect = connect;
export default MultiRange;
