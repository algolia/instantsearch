import suit from '../suit';

it('expect to return "ais-Widget"', () => {
  const name = 'Widget';

  const expectation = 'ais-Widget';
  const actual = suit(name);

  expect(actual).toBe(expectation);
});

it('expect to return "ais-Widget--modifier"', () => {
  const name = 'Widget';
  const modifier = 'modifier';

  const expectation = 'ais-Widget--modifier';
  const actual = suit(name, '', modifier);

  expect(actual).toBe(expectation);
});

it('expect to return "ais-Widget-element"', () => {
  const name = 'Widget';
  const element = 'element';

  const expectation = 'ais-Widget-element';
  const actual = suit(name, element);

  expect(actual).toBe(expectation);
});

it('expect to return "ais-Widget-element--modifier"', () => {
  const name = 'Widget';
  const element = 'element';
  const modifier = 'modifier';

  const expectation = 'ais-Widget-element--modifier';
  const actual = suit(name, element, modifier);

  expect(actual).toBe(expectation);
});

it('expect to throw when widget is not provided', () => {
  expect(() => suit()).toThrow('You need to provide `widgetName` in your data');
});
