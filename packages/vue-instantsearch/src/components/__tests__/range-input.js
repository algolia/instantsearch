import Vue from 'vue';
import { FACET_OR } from '../../store';
import RangeInput from '../RangeInput.vue';

describe.skip('RangeInput', () => {
  const attributeName = 'price';
  const createFakeStore = props =>
    Object.assign(
      {
        activeRefinements: [],
        addFacet: jest.fn(),
        removeFacet: jest.fn(),
        addNumericRefinement: jest.fn(),
        removeNumericRefinement: jest.fn(),
        getFacetStats: jest.fn(() => ({})),
        start: jest.fn(),
        stop: jest.fn(),
        refresh: jest.fn(),
      },
      props
    );

  const render = propsData => {
    const slots = propsData.slots || {};

    // eslint-disable-next-line
    delete propsData.slots;

    const Component = Vue.extend(RangeInput);
    const vm = new Component({
      propsData,
    });

    // Hacky way to simulate slots for
    // snapshot... Waiting the release of
    // vue-test-utils
    Object.entries(slots).forEach(([name, element]) => {
      vm.$slots[name] = [element];
    });

    return vm.$mount();
  };

  test('render default', () => {
    const searchStore = createFakeStore();
    const component = render({
      attributeName,
      searchStore,
    });

    expect(component.$el.outerHTML).toMatchSnapshot();
    expect(component.attributeName).toBe('price');
  });

  test('render with values', () => {
    const searchStore = createFakeStore({
      activeRefinements: [
        {
          attributeName,
          type: 'numeric',
          operator: '>=',
          numericValue: 10,
        },
        {
          attributeName,
          type: 'numeric',
          operator: '<=',
          numericValue: 490,
        },
      ],
    });

    const component = render({
      attributeName,
      searchStore,
    });

    expect(
      component.$el.querySelector('.ais-range-input__input--from').value
    ).toBe('10');

    expect(
      component.$el.querySelector('.ais-range-input__input--to').value
    ).toBe('490');
  });

  test('render with min', () => {
    const searchStore = createFakeStore();
    const component = render({
      attributeName,
      min: 10,
      searchStore,
    });

    expect(component.$el.outerHTML).toMatchSnapshot();
    expect(component.min).toBe(10);
  });

  test('render with max', () => {
    const searchStore = createFakeStore();
    const component = render({
      attributeName,
      max: 500,
      searchStore,
    });

    expect(component.$el.outerHTML).toMatchSnapshot();
    expect(component.max).toBe(500);
  });

  test('render with precision', () => {
    const searchStore = createFakeStore();
    const component = render({
      attributeName,
      precision: 2,
      searchStore,
    });

    expect(component.$el.outerHTML).toMatchSnapshot();
    expect(component.precision).toBe(2);
  });

  test('render with header', () => {
    const searchStore = createFakeStore();
    const component = render({
      attributeName,
      searchStore,
      slots: {
        header: 'Custom header',
      },
    });

    expect(component.$el.outerHTML).toMatchSnapshot();
  });

  test('render with footer', () => {
    const searchStore = createFakeStore();
    const component = render({
      attributeName,
      searchStore,
      slots: {
        footer: 'Custom footer',
      },
    });

    expect(component.$el.outerHTML).toMatchSnapshot();
  });

  test('render with separator', () => {
    const searchStore = createFakeStore();
    const component = render({
      attributeName,
      searchStore,
      slots: {
        separator: '--->',
      },
    });

    expect(component.$el.outerHTML).toMatchSnapshot();
  });

  test('render with submit', () => {
    const searchStore = createFakeStore();
    const component = render({
      attributeName,
      searchStore,
      slots: {
        submit: 'Go',
      },
    });

    expect(component.$el.outerHTML).toMatchSnapshot();
  });

  test('expect to call onSubmit when submit', () => {
    const searchStore = createFakeStore();
    const component = render({
      attributeName,
      searchStore,
    });

    const onSubmit = jest.spyOn(component, 'onSubmit');

    const form = component.$el.querySelector('form');
    const event = new window.Event('submit');

    form.dispatchEvent(event);
    component._watcher.run();

    expect(onSubmit).toHaveBeenCalled();

    onSubmit.mockClear();
    onSubmit.mockReset();
  });

  test('expect to set min when min input change', () => {
    const searchStore = createFakeStore();
    const component = render({
      attributeName,
      searchStore,
    });

    const input = component.$el.querySelector('.ais-range-input__input--from');
    const event = new window.Event('input');

    input.value = 5;

    input.dispatchEvent(event);
    component._watcher.run();

    expect(component.refinement.min).toBe('5');
  });

  test('expect to set max when max input change', () => {
    const searchStore = createFakeStore();
    const component = render({
      attributeName,
      searchStore,
    });

    const input = component.$el.querySelector('.ais-range-input__input--to');
    const event = new window.Event('input');

    input.value = 10;

    input.dispatchEvent(event);
    component._watcher.run();

    expect(component.refinement.max).toBe('10');
  });

  describe('created', () => {
    test('expect to add the facet attribute', () => {
      const searchStore = createFakeStore();

      render({
        attributeName,
        searchStore,
      });

      expect(searchStore.addFacet).toHaveBeenCalledWith('price', FACET_OR);
    });

    test('expect to refine min from default refinement', () => {
      const searchStore = createFakeStore();

      render({
        attributeName,
        searchStore,
        min: 10,
        defaultRefinement: {
          min: 20,
        },
      });

      expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
        'price',
        '>=',
        20
      );
    });

    test('expect to refine max from default refinement', () => {
      const searchStore = createFakeStore();

      render({
        attributeName,
        searchStore,
        max: 500,
        defaultRefinement: {
          max: 490,
        },
      });

      expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
        'price',
        '<=',
        490
      );
    });

    test('expect to refine min from bound', () => {
      const searchStore = createFakeStore();

      render({
        attributeName,
        searchStore,
        min: 10,
      });

      expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
        'price',
        '>=',
        10
      );
    });

    test('expect to refine max from bound', () => {
      const searchStore = createFakeStore();

      render({
        attributeName,
        searchStore,
        max: 500,
      });

      expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
        'price',
        '<=',
        500
      );
    });

    test('expect to call stop, start & refresh', () => {
      const searchStore = createFakeStore();

      render({
        attributeName,
        searchStore,
      });

      expect(searchStore.start).toHaveBeenCalledTimes(1);
      expect(searchStore.stop).toHaveBeenCalledTimes(1);
      expect(searchStore.refresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('destroyed', () => {
    test('expect to remove the facet attribute', () => {
      const searchStore = createFakeStore();

      const component = render({
        attributeName,
        searchStore,
      });

      component.$destroy();

      expect(searchStore.removeFacet).toHaveBeenCalledWith('price');
    });
  });

  describe('computed', () => {
    describe('step', () => {
      test('expect to return a step from a precision of 0', () => {
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
          precision: 0,
        });

        const expectation = 1;
        const actual = component.step;

        expect(actual).toBe(expectation);
      });

      test('expect to return a step from a precision of 1', () => {
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
          precision: 1,
        });

        const expectation = 0.1;
        const actual = component.step;

        expect(actual).toBe(expectation);
      });

      test('expect to return a step from a precision of 2', () => {
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
          precision: 2,
        });

        const expectation = 0.01;
        const actual = component.step;

        expect(actual).toBe(expectation);
      });
    });

    describe('refinement', () => {
      test('expect to return the current refinement', () => {
        const searchStore = createFakeStore({
          activeRefinements: [
            {
              attributeName,
              type: 'numeric',
              operator: '>=',
              numericValue: 10,
            },
            {
              attributeName,
              type: 'numeric',
              operator: '<=',
              numericValue: 500,
            },
          ],
        });

        const component = render({
          attributeName,
          searchStore,
        });

        const expectation = { min: 10, max: 500 };
        const actual = component.refinement;

        expect(actual).toEqual(expectation);
      });

      test('expect to return undefined when refinement is not set', () => {
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
        });

        const expectation = {};
        const actual = component.refinement;

        expect(actual).toEqual(expectation);
      });
    });

    describe('range', () => {
      test('expect to return the range from boundaries', () => {
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
          min: 10,
          max: 500,
        });

        const expectation = {
          min: 10,
          max: 500,
        };

        const actual = component.range;

        expect(actual).toEqual(expectation);
      });

      test('expect to return the range from stats', () => {
        const searchStore = createFakeStore({
          getFacetStats: jest.fn(() => ({
            min: 0,
            max: 799,
          })),
        });

        const component = render({
          attributeName,
          searchStore,
        });

        const expectation = {
          min: 0,
          max: 799,
        };

        const actual = component.range;

        expect(actual).toEqual(expectation);
        expect(searchStore.getFacetStats).toHaveBeenCalledWith(attributeName);
      });

      test('expect to return the default range', () => {
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
        });

        const expectation = {
          min: -Infinity,
          max: Infinity,
        };

        const actual = component.range;

        expect(actual).toEqual(expectation);
      });

      test('expect to return the range with a precision of 0', () => {
        const searchStore = createFakeStore({
          getFacetStats: () => ({
            min: 10.1234,
            max: 799.5678,
          }),
        });

        const component = render({
          attributeName,
          searchStore,
        });

        const expectation = {
          min: 10,
          max: 800,
        };

        const actual = component.range;

        expect(actual).toEqual(expectation);
      });

      test('expect to return the range with a precision of 1', () => {
        const searchStore = createFakeStore({
          getFacetStats: () => ({
            min: 10.1234,
            max: 799.5678,
          }),
        });

        const component = render({
          attributeName,
          searchStore,
          precision: 1,
        });

        const expectation = {
          min: 10.1,
          max: 799.6,
        };

        const actual = component.range;

        expect(actual).toEqual(expectation);
      });

      test('expect to return the range with a precision of 2', () => {
        const searchStore = createFakeStore({
          getFacetStats: () => ({
            min: 10.1234,
            max: 799.5678,
          }),
        });

        const component = render({
          attributeName,
          searchStore,
          precision: 2,
        });

        const expectation = {
          min: 10.12,
          max: 799.57,
        };

        const actual = component.range;

        expect(actual).toEqual(expectation);
      });
    });

    describe('rangeForRendering', () => {
      test('expect to return the given range when both value are different from Infinity', () => {
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
          min: 0,
          max: 500,
        });

        const expectation = {
          min: 0,
          max: 500,
        };

        const actual = component.rangeForRendering;

        expect(actual).toEqual(expectation);
      });

      test('expect to return an empty string as range when min value is -Infinity', () => {
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
          max: 500,
        });

        const expectation = {
          min: '',
          max: '',
        };

        const actual = component.rangeForRendering;

        expect(actual).toEqual(expectation);
      });

      test('expect to return an empty string as range when max value is Infinity', () => {
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
          min: 0,
        });

        const expectation = {
          min: '',
          max: '',
        };

        const actual = component.rangeForRendering;

        expect(actual).toEqual(expectation);
      });
    });

    describe('refinementForRendering', () => {
      test('expect to return the refinement when values are defined & differ from range', () => {
        const searchStore = createFakeStore({
          activeRefinements: [
            {
              attributeName,
              type: 'numeric',
              operator: '>=',
              numericValue: 10,
            },
            {
              attributeName,
              type: 'numeric',
              operator: '<=',
              numericValue: 490,
            },
          ],
        });

        const component = render({
          attributeName,
          searchStore,
          min: 0,
          max: 500,
        });

        const expectation = {
          min: 10,
          max: 490,
        };

        const actual = component.refinementForRendering;

        expect(actual).toEqual(expectation);
      });

      test('expect to return the min refinement as empty string when value is not defined', () => {
        const searchStore = createFakeStore({
          activeRefinements: [
            {
              attributeName,
              type: 'numeric',
              operator: '<=',
              numericValue: 490,
            },
          ],
        });

        const component = render({
          attributeName,
          searchStore,
          min: 0,
          max: 500,
        });

        const expectation = {
          min: '',
          max: 490,
        };

        const actual = component.refinementForRendering;

        expect(actual).toEqual(expectation);
      });

      test('expect to return the max refinement as empty string when value is not defined', () => {
        const searchStore = createFakeStore({
          activeRefinements: [
            {
              attributeName,
              type: 'numeric',
              operator: '>=',
              numericValue: 10,
            },
          ],
        });

        const component = render({
          attributeName,
          searchStore,
          min: 0,
          max: 500,
        });

        const expectation = {
          min: 10,
          max: '',
        };

        const actual = component.refinementForRendering;

        expect(actual).toEqual(expectation);
      });

      test('expect to return the min refinement as empty string when value is equal to range', () => {
        const searchStore = createFakeStore({
          activeRefinements: [
            {
              attributeName,
              type: 'numeric',
              operator: '>=',
              numericValue: 0,
            },
            {
              attributeName,
              type: 'numeric',
              operator: '<=',
              numericValue: 490,
            },
          ],
        });

        const component = render({
          attributeName,
          searchStore,
          min: 0,
          max: 500,
        });

        const expectation = {
          min: '',
          max: 490,
        };

        const actual = component.refinementForRendering;

        expect(actual).toEqual(expectation);
      });

      test('expect to return the max refinement as empty string when value is equal to range', () => {
        const searchStore = createFakeStore({
          activeRefinements: [
            {
              attributeName,
              type: 'numeric',
              operator: '>=',
              numericValue: 10,
            },
            {
              attributeName,
              type: 'numeric',
              operator: '<=',
              numericValue: 500,
            },
          ],
        });

        const component = render({
          attributeName,
          searchStore,
          min: 0,
          max: 500,
        });

        const expectation = {
          min: 10,
          max: '',
        };

        const actual = component.refinementForRendering;

        expect(actual).toEqual(expectation);
      });
    });
  });

  describe('methods', () => {
    describe('onSubmit', () => {
      test('expect to refine min value', () => {
        const operator = '>=';
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
        });

        component.onSubmit({
          min: 10,
        });

        expect(searchStore.removeNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator
        );

        expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator,
          10
        );
      });

      test('expect to refine max value', () => {
        const operator = '<=';
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
        });

        component.onSubmit({
          max: 490,
        });

        expect(searchStore.removeNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator
        );

        expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator,
          490
        );
      });

      test('expect to refine min value with float number', () => {
        const operator = '>=';
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
        });

        component.onSubmit({
          min: 10.1234,
        });

        expect(searchStore.removeNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator
        );

        expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator,
          10.1234
        );
      });

      test('expect to refine max value with float number', () => {
        const operator = '<=';
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
        });

        component.onSubmit({
          max: 489.5678,
        });

        expect(searchStore.removeNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator
        );

        expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator,
          489.5678
        );
      });

      test('expect to refine min value with parsable number', () => {
        const operator = '>=';
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
        });

        component.onSubmit({
          min: '10',
        });

        expect(searchStore.removeNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator
        );

        expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator,
          10
        );
      });

      test('expect to refine max value with parsable number', () => {
        const operator = '<=';
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
        });

        component.onSubmit({
          max: '490',
        });

        expect(searchStore.removeNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator
        );

        expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator,
          490
        );
      });

      test('expect to refine min value when value is equal to min range & bound are defined', () => {
        const operator = '>=';
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
          min: 10,
        });

        component.onSubmit({
          min: 10,
        });

        expect(searchStore.removeNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator
        );

        expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator,
          10
        );
      });

      test('expect to refine max value when value is equal to max range & bound are defined', () => {
        const operator = '<=';
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
          max: 490,
        });

        component.onSubmit({
          max: 490,
        });

        expect(searchStore.removeNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator
        );

        expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator,
          490
        );
      });

      test('expect to reset min value when value is not defined', () => {
        const operator = '>=';
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
        });

        component.onSubmit({
          max: 490,
        });

        expect(searchStore.removeNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator
        );

        expect(searchStore.addNumericRefinement).not.toHaveBeenCalledWith(
          attributeName,
          operator,
          undefined
        );

        expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          '<=',
          490
        );
      });

      test('expect to reset max value when value is not defined', () => {
        const operator = '<=';
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
        });

        component.onSubmit({
          min: 10,
        });

        expect(searchStore.removeNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator
        );

        expect(searchStore.addNumericRefinement).not.toHaveBeenCalledWith(
          attributeName,
          operator,
          undefined
        );

        expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          '>=',
          10
        );
      });

      test('expect to reset min value when value is an empty string', () => {
        const operator = '>=';
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
        });

        component.onSubmit({
          min: '',
          max: 490,
        });

        expect(searchStore.removeNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator
        );

        expect(searchStore.addNumericRefinement).not.toHaveBeenCalledWith(
          attributeName,
          operator,
          undefined
        );

        expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          '<=',
          490
        );
      });

      test('expect to reset max value when value is an empty string', () => {
        const operator = '<=';
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
        });

        component.onSubmit({
          min: 10,
          max: '',
        });

        expect(searchStore.removeNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator
        );

        expect(searchStore.addNumericRefinement).not.toHaveBeenCalledWith(
          attributeName,
          operator,
          undefined
        );

        expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          '>=',
          10
        );
      });

      test('expect to reset min value when value is equal to min range & bound are not defined', () => {
        const operator = '>=';

        const searchStore = createFakeStore({
          getFacetStats: () => ({
            min: 0,
            max: 799,
          }),
        });

        const component = render({
          attributeName,
          searchStore,
        });

        component.onSubmit({
          min: 0,
          max: 250,
        });

        expect(searchStore.removeNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator
        );

        expect(searchStore.addNumericRefinement).not.toHaveBeenCalledWith(
          attributeName,
          operator,
          undefined
        );

        expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          '<=',
          250
        );
      });

      test('expect to reset max value when value is equal to max range & bound are not defined', () => {
        const operator = '<=';

        const searchStore = createFakeStore({
          getFacetStats: () => ({
            min: 0,
            max: 799,
          }),
        });

        const component = render({
          attributeName,
          searchStore,
        });

        component.onSubmit({
          min: 10,
          max: 799,
        });

        expect(searchStore.removeNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          operator
        );

        expect(searchStore.addNumericRefinement).not.toHaveBeenCalledWith(
          attributeName,
          operator,
          undefined
        );

        expect(searchStore.addNumericRefinement).toHaveBeenCalledWith(
          attributeName,
          '>=',
          10
        );
      });

      test('expect to call stop, start & refresh', () => {
        const searchStore = createFakeStore();
        const component = render({
          attributeName,
          searchStore,
        });

        searchStore.stop.mockClear();
        searchStore.start.mockClear();
        searchStore.refresh.mockClear();

        component.onSubmit({});
        component.onSubmit({});

        expect(searchStore.stop).toHaveBeenCalledTimes(2);
        expect(searchStore.start).toHaveBeenCalledTimes(2);
        expect(searchStore.refresh).toHaveBeenCalledTimes(2);
      });
    });
  });
});
