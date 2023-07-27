import { isValidConfig } from '@codeshift/validator';

test('is valid config', () => {
  const validConfig = isValidConfig(require('../src/codeshift.config'));

  expect(validConfig).toBe(true);
});
