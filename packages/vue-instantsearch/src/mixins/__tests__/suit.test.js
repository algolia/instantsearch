/**
 * @jest-environment jsdom
 */

import { mount } from '../../../test/utils';
import { createSuitMixin } from '../suit';

const createFakeComponent = () => ({
  render: () => null,
});

it('exposes the regular suit function for this widget', () => {
  const Test = createFakeComponent();

  const wrapper = mount(Test, {
    mixins: [createSuitMixin({ name: 'Test' })],
  });
  const { suit } = wrapper.vm;

  expect(suit()).toMatchInlineSnapshot(`"ais-Test"`);
  expect(suit('', 'ok')).toMatchInlineSnapshot(`"ais-Test--ok"`);
  expect(suit('ok')).toMatchInlineSnapshot(`"ais-Test-ok"`);
  expect(suit('ok', 'there')).toMatchInlineSnapshot(`"ais-Test-ok--there"`);
});

it('allows overriding from the `class-names` prop', () => {
  const Test = {
    props: {
      classNames: { type: Object },
    },
    render: () => null,
  };

  const wrapper = mount(Test, {
    propsData: {
      classNames: {
        'ais-Test': 'dogs',
        'ais-Test--ok': 'dogs cats',
      },
    },
    mixins: [createSuitMixin({ name: 'Test' })],
  });

  const { suit } = wrapper.vm;

  expect(suit()).toMatchInlineSnapshot(`"ais-Test dogs"`);
  expect(suit('', 'ok')).toMatchInlineSnapshot(`"ais-Test--ok dogs cats"`);
  expect(suit('ok')).toMatchInlineSnapshot(`"ais-Test-ok"`);
  expect(suit('ok', 'there')).toMatchInlineSnapshot(`"ais-Test-ok--there"`);
});
