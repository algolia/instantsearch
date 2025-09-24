/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { getWidgetAttribute } from '..';
import { createInitOptions } from '../../../../test/createWidget';
import { connectRefinementList } from '../../../connectors';
import {
  hierarchicalMenu,
  hits,
  panel,
  refinementList,
  toggleRefinement,
} from '../../../widgets';

describe('getWidgetAttribute', () => {
  it('reads the attribute from a refinementList', () => {
    expect(
      getWidgetAttribute(
        refinementList({
          container: document.createElement('div'),
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
          container: document.createElement('div'),
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
          container: document.createElement('div'),
          attribute: 'test',
          on: 'yes',
          off: 'no',
        }),
        createInitOptions()
      )
    ).toBe('test');
  });

  it('reads the attribute from a panel', () => {
    expect(
      getWidgetAttribute(
        panel()(refinementList)({
          container: document.createElement('div'),
          attribute: 'test',
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
    expect(() =>
      getWidgetAttribute(
        hits({ container: document.createElement('div') }),
        createInitOptions()
      )
    ).toThrow(`Could not find the attribute of the widget:

{"$$type":"ais.hits","$$widgetType":"ais.hits"}

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
