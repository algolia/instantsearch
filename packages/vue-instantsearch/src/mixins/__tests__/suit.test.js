import { mount, createLocalVue } from '@vue/test-utils';
import { createSuitMixin } from '../suit';

const createFakeComponent = localVue =>
  localVue.component('Test', {
    render: () => null,
  });

it('exposes the regular suit function for this widget', () => {
  const localVue = createLocalVue();
  const Test = createFakeComponent(localVue);

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
  const localVue = createLocalVue();
  const Test = localVue.component('Test', {
    props: {
      classNames: { type: Object },
    },
    render: () => null,
  });

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
