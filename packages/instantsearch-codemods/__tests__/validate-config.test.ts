import { isValidConfig } from '@codeshift/validator';

import addWidgetToAddWidgets from '../src/addWidget-to-addWidgets';
import risV6ToV7 from '../src/ris-v6-to-v7';
import rishToRis from '../src/rish-to-ris';

test('is valid config', () => {
  const config = {
    description: 'Codemods for InstantSearch libraries',
    transforms: {},
    presets: {
      'ris-v6-to-v7': risV6ToV7,
      'rish-to-ris': rishToRis,
      'addWidget-to-addWidgets': addWidgetToAddWidgets,
    },
  };

  expect(isValidConfig(config)).toBe(true);
});
