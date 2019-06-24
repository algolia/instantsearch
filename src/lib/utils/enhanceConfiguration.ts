import { SearchParameters, Widget } from '../../types';
import mergeDeep from './mergeDeep';

function enhanceConfiguration(
  configuration: Partial<SearchParameters>,
  widget: Widget
): Partial<SearchParameters> {
  if (!widget.getConfiguration) {
    return configuration;
  }

  // Get the relevant partial configuration asked by the widget
  const partialConfiguration = widget.getConfiguration(configuration);

  return mergeDeep(configuration, partialConfiguration);
}

export default enhanceConfiguration;
