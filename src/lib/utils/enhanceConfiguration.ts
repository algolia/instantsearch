import { PlainSearchParameters } from 'algoliasearch-helper';
import { Widget } from '../../types';
import mergeDeep from './mergeDeep';

function enhanceConfiguration(
  configuration: PlainSearchParameters,
  widget: Widget
): PlainSearchParameters {
  if (!widget.getConfiguration) {
    return configuration;
  }

  // Get the relevant partial configuration asked by the widget
  const partialConfiguration = widget.getConfiguration(configuration);

  return mergeDeep(configuration, partialConfiguration);
}

export default enhanceConfiguration;
