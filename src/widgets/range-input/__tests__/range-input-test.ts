/** @jsx h */

import { render as preactRender, VNode } from 'preact';
import algoliasearchHelper, { AlgoliaSearchHelper } from 'algoliasearch-helper';
import rangeInput from '../range-input';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { castToJestMock } from '../../../../test/utils/castToJestMock';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createInstantSearch } from '../../../../test/mock/createInstantSearch';
import { InstantSearch } from '../../../types';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('rangeInput', () => {
  const attribute = 'aNumAttr';
  let container: HTMLElement;
  let helper: AlgoliaSearchHelper;
  let instantSearchInstance: InstantSearch;

  beforeEach(() => {
    render.mockClear();
    container = document.createElement('div');
    instantSearchInstance = createInstantSearch();
    helper = algoliasearchHelper(createSearchClient(), '', {});
  });

  describe('Usage', () => {
    it('throws without container', () => {
      // @ts-expect-error container shouldn't be undefined
      expect(() => rangeInput({ container: undefined }))
        .toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/range-input/js/"
`);
    });

    it('is a widget', () => {
      const widget = rangeInput({ container, attribute: 'price' });

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.rangeInput',
          $$widgetType: 'ais.rangeInput',
        })
      );
    });
  });

  describe('Lifecycle', () => {
    describe('dispose', () => {
      it('unmounts the component', () => {
        const widget = rangeInput({
          attribute: 'price',
          container,
        });

        expect(render).toHaveBeenCalledTimes(0);

        widget.dispose!(
          createDisposeOptions({
            state: helper.state,
            helper,
          })
        );

        expect(render).toHaveBeenCalledTimes(1);
        expect(render).toHaveBeenLastCalledWith(null, container);
      });
    });
  });

  it('expect to render with results', () => {
    const results = {
      disjunctiveFacets: [
        {
          name: attribute,
          stats: {
            min: 10,
            max: 500,
          },
        },
      ],
    };

    const widget = rangeInput({
      container,
      attribute,
    });

    widget.init!(createInitOptions({ helper, instantSearchInstance }));
    // @ts-expect-error SearchResults are missing properties that are not useful for this test
    widget.render!(createRenderOptions({ results, helper }));

    const firstRender = render.mock.calls[0][0] as VNode;

    expect(render).toHaveBeenCalledTimes(1);
    expect((firstRender.props as any).min).toBe(10);
    expect((firstRender.props as any).max).toBe(500);
    expect(firstRender.props).toMatchSnapshot();
  });

  it('expect to render without results', () => {
    const widget = rangeInput({
      container,
      attribute,
    });

    widget.init!(createInitOptions({ helper, instantSearchInstance }));
    widget.render!(createRenderOptions({ helper }));

    const firstRender = render.mock.calls[0][0] as VNode;

    expect(render).toHaveBeenCalledTimes(1);
    expect(firstRender.props).toMatchSnapshot();
  });

  it('expect to render with custom classNames', () => {
    const widget = rangeInput({
      container,
      attribute,
      cssClasses: {
        root: 'root',
        noRefinement: 'noRefinement',
        form: 'form',
        label: 'label',
        input: 'input',
        inputMin: 'inputMin',
        inputMax: 'inputMax',
        separator: 'separator',
        submit: 'submit',
      },
    });

    widget.init!(createInitOptions({ helper, instantSearchInstance }));
    widget.render!(createRenderOptions({ helper }));

    const firstRender = render.mock.calls[0][0] as VNode;

    expect(render).toHaveBeenCalledTimes(1);
    expect(firstRender.props).toMatchSnapshot();
  });

  it('expect to render with custom templates', () => {
    const widget = rangeInput({
      container,
      attribute,
      templates: {
        separatorText: 'custom separator',
        submitText: 'custom submit',
      },
    });

    widget.init!(createInitOptions({ helper, instantSearchInstance }));
    widget.render!(createRenderOptions({ helper }));

    const firstRender = render.mock.calls[0][0] as VNode;

    expect(render).toHaveBeenCalledTimes(1);
    expect(firstRender.props).toMatchSnapshot();
  });

  it('expect to render with min', () => {
    const widget = rangeInput({
      container,
      attribute,
      min: 20,
    });

    widget.init!(createInitOptions({ helper, instantSearchInstance }));
    widget.render!(createRenderOptions({ helper }));

    const firstRender = render.mock.calls[0][0] as VNode;

    expect(render).toHaveBeenCalledTimes(1);
    expect((firstRender.props as any).min).toBe(20);
  });

  it('expect to render with max', () => {
    const widget = rangeInput({
      container,
      attribute,
      max: 480,
    });

    widget.init!(createInitOptions({ helper, instantSearchInstance }));
    widget.render!(createRenderOptions({ helper }));

    const firstRender = render.mock.calls[0][0] as VNode;

    expect(render).toHaveBeenCalledTimes(1);
    expect((firstRender.props as any).max).toBe(480);
  });

  it('expect to render with refinement', () => {
    const results = {
      disjunctiveFacets: [
        {
          name: attribute,
          stats: {
            min: 10,
            max: 500,
          },
        },
      ],
    };

    helper.addNumericRefinement(attribute, '>=', 25);
    helper.addNumericRefinement(attribute, '<=', 475);

    const widget = rangeInput({
      container,
      attribute,
    });

    widget.init!(createInitOptions({ helper, instantSearchInstance }));
    // @ts-expect-error SearchResults are missing properties that are not useful for this test
    widget.render!(createRenderOptions({ results, helper }));

    const firstRender = render.mock.calls[0][0] as VNode;

    expect(render).toHaveBeenCalledTimes(1);
    expect(firstRender.props).toMatchSnapshot();
    expect((firstRender.props as any).values).toEqual({
      min: 25,
      max: 475,
    });
  });

  it('expect to render with refinement at boundaries', () => {
    helper.addNumericRefinement(attribute, '>=', 10);
    helper.addNumericRefinement(attribute, '<=', 500);

    const widget = rangeInput({
      container,
      attribute,
      min: 10,
      max: 500,
    });

    widget.init!(createInitOptions({ helper, instantSearchInstance }));
    widget.render!(createRenderOptions({ helper }));

    const firstRender = render.mock.calls[0][0] as VNode;

    expect(render).toHaveBeenCalledTimes(1);
    expect(firstRender.props).toMatchSnapshot();
    expect((firstRender.props as any).values).toEqual({
      min: undefined,
      max: undefined,
    });
  });

  describe('precision', () => {
    it('expect to render with default precision', () => {
      const widget = rangeInput({
        container,
        attribute,
        precision: 2,
      });

      widget.init!(createInitOptions({ helper, instantSearchInstance }));
      widget.render!(createRenderOptions({ helper }));

      const firstRender = render.mock.calls[0][0] as VNode;

      expect(render).toHaveBeenCalledTimes(1);
      expect((firstRender.props as any).step).toBe(0.01);
    });

    it('expect to render with precision of 0', () => {
      const widget = rangeInput({
        container,
        attribute,
        precision: 0,
      });

      widget.init!(createInitOptions({ helper, instantSearchInstance }));
      widget.render!(createRenderOptions({ helper }));

      const firstRender = render.mock.calls[0][0] as VNode;

      expect(render).toHaveBeenCalledTimes(1);
      expect((firstRender.props as any).step).toBe(1);
    });

    it('expect to render with precision of 1', () => {
      const widget = rangeInput({
        container,
        attribute,
        precision: 1,
      });

      widget.init!(createInitOptions({ helper, instantSearchInstance }));
      widget.render!(createRenderOptions({ helper }));

      const firstRender = render.mock.calls[0][0] as VNode;

      expect(render).toHaveBeenCalledTimes(1);
      expect((firstRender.props as any).step).toBe(0.1);
    });
  });
});
