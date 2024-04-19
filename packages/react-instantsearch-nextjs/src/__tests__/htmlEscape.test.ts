import { htmlEscapeJsonString } from '../htmlEscape';

it('encodes HTML related characters into entities that are decoded by JSON.parse', () => {
  const input = { description: '<h1>Hello</h1>' };
  const output = htmlEscapeJsonString(JSON.stringify(input));

  expect(output).toBe(
    '{"description":"\\u003ch1\\u003eHello\\u003c/h1\\u003e"}'
  );
  expect(JSON.parse(output)).toEqual(input);
});
