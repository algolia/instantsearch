/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import styling from './styling';

describe('styling', () => {
  it('should merge theme by adding new className to the default one', () => {
    const Component = {};
    Component.defaultClassNames = {
      keyA: 'className_1',
      keyB: 'className_2',
    };

    const mergedTheme = styling(Component.defaultClassNames, {keyB: 'className_3'});

    expect(mergedTheme).toEqual({
      keyA: 'className_1',
      keyB: 'className_2 className_3',
    });
  });
});
