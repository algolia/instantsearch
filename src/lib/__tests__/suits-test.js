import { component } from '../suit';

describe('suit - component classname generation', () => {
  test('generates a name with the component name, modifier and descendant', () => {
    expect(
      component('MyComponent')({
        modifierName: 'mod',
        descendantName: 'desc',
      })
    ).toEqual('ais-MyComponent-desc--mod');
  });

  test('generates a name with the component name and descendant', () => {
    expect(component('MyComponent')({ descendantName: 'desc' })).toEqual(
      'ais-MyComponent-desc'
    );
  });

  test('generates a name with the component name and modifier', () => {
    expect(component('MyComponent')({ modifierName: 'mod' })).toEqual(
      'ais-MyComponent--mod'
    );
  });
});
