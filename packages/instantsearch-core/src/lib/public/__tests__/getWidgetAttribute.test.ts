/**
 * @jest-environment jsdom
 */

import { getWidgetAttribute } from '..';
import {
  connectHits,
  connectRefinementList,
  connectHierarchicalMenu,
  connectToggleRefinement,
} from '../../..';
import { createInitOptions } from '../../../../test/createWidget';

const hierarchicalMenu = connectHierarchicalMenu(() => {});
const hits = connectHits(() => {});
const refinementList = connectRefinementList(() => {});
const toggleRefinement = connectToggleRefinement(() => {});

describe('getWidgetAttribute', () => {
  it('reads the attribute from a refinementList', () => {
    expect(
      getWidgetAttribute(
        refinementList({
          attribute: 'test',
        }),
        createInitOptions()
      )
    ).toBe('test');
  });

  it('reads the attribute from a connectRefinementList', () => {
    expect(
      getWidgetAttribute(
        connectRefinementList(() => {})({ attribute: 'test' }),
        createInitOptions()
      )
    ).toBe('test');
  });

  it('reads the attribute from a hierarchicalMenu', () => {
    expect(
      getWidgetAttribute(
        hierarchicalMenu({
          attributes: ['test1', 'test2'],
        }),
        createInitOptions()
      )
    ).toBe('test1');
  });

  it('reads the attribute from a toggleRefinement', () => {
    expect(
      getWidgetAttribute(
        toggleRefinement({
          attribute: 'test',
          on: 'yes',
          off: 'no',
        }),
        createInitOptions()
      )
    ).toBe('test');
  });

  it('reads the attribute from a custom widget', () => {
    expect(
      getWidgetAttribute(
        {
          $$type: 'mock.widget',
          getWidgetRenderState() {
            return { widgetParams: { attribute: 'test' } };
          },
        },
        createInitOptions()
      )
    ).toBe('test');
  });

  it('does not read the attribute from hits', () => {
    expect(() => getWidgetAttribute(hits({}), createInitOptions()))
      .toThrow(`Could not find the attribute of the widget:

{"$$type":"ais.hits"}

Please check whether the widget's getWidgetRenderState returns widgetParams.attribute correctly.`);
  });

  it('does not read the attribute from a custom widget without getWidgetRenderState', () => {
    expect(() =>
      getWidgetAttribute(
        // @ts-expect-error testing invalid input
        {},
        createInitOptions()
      )
    ).toThrow(`Could not find the attribute of the widget:

{}

Please check whether the widget's getWidgetRenderState returns widgetParams.attribute correctly.`);
  });

  it('does not read the attribute from a custom widget without widgetParams in getWidgetRenderState', () => {
    expect(() =>
      getWidgetAttribute(
        {
          // @ts-expect-error testing invalid input
          getWidgetRenderState() {
            return { yo: true };
          },
        },
        createInitOptions()
      )
    ).toThrow(`Could not find the attribute of the widget:

{}

Please check whether the widget's getWidgetRenderState returns widgetParams.attribute correctly.`);
  });

  it('does not read the attribute from a custom widget with nothing in getWidgetRenderState', () => {
    expect(() =>
      getWidgetAttribute(
        {
          // @ts-expect-error testing invalid input
          getWidgetRenderState() {},
        },
        createInitOptions()
      )
    ).toThrow(`Could not find the attribute of the widget:

{}

Please check whether the widget's getWidgetRenderState returns widgetParams.attribute correctly.`);
  });
});
