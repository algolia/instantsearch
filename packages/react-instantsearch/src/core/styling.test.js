/* eslint-env jest, jasmine */
/* eslint-disable no-console */

import styling from './styling';

describe('styling', () => {
  it('should override style by adding new className to the default theme', () => {
    const Component = {};
    Component.defaultTheme = {
      keyA: 'className_1',
      keyB: 'className_2',
    };

    const overridedTheme = styling(Component, {keyB: 'className_3'});

    expect(overridedTheme).toEqual({
      keyA: 'className_1',
      keyB: 'className_2 className_3',
    });
  });

  it('should throw an error if no default theme is existing for a given component', () => {
    const Component = {};
    Component.displayName = 'name';

    function toStyle(){
      styling(Component, {});
    }

    expect(toStyle).toThrowError('Component name does not have a default theme to override');
  });
});
