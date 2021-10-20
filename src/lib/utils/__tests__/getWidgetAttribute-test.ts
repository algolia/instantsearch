import { getWidgetAttribute } from '../';
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
        })
      )
    ).toBe('test');
  });

  it('reads the attribute from a connectRefinementList', () => {
    expect(
      getWidgetAttribute(connectRefinementList(() => {})({ attribute: 'test' }))
    ).toBe('test');
  });

  it('reads the attribute from a hierarchicalMenu', () => {
    expect(
      getWidgetAttribute(
        hierarchicalMenu({
          container: document.createElement('div'),
          attributes: ['test1', 'test2'],
        })
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
        })
      )
    ).toBe('test');
  });

  it('reads the attribute from a panel', () => {
    expect(
      getWidgetAttribute(
        panel()(refinementList)({
          container: document.createElement('div'),
          attribute: 'test',
        })
      )
    ).toBe('test');
  });

  it('reads the attribute from a custom widget', () => {
    expect(
      getWidgetAttribute({
        $$type: 'mock.widget',
        getWidgetRenderState() {
          return { widgetParams: { attribute: 'test' } };
        },
      })
    ).toBe('test');
  });

  it('does not read the attribute from hits', () => {
    expect(() =>
      getWidgetAttribute(hits({ container: document.createElement('div') }))
    ).toThrowError(`Could not find the attribute of the widget:

{"$$type":"ais.hits","$$widgetType":"ais.hits"}

Please check whether the widget's getWidgetRenderState returns widgetParams.attribute correctly.`);
  });

  it('does not read the attribute from a custom widget without getWidgetRenderState', () => {
    expect(() =>
      getWidgetAttribute(
        // @ts-expect-error testing invalid input
        {}
      )
    ).toThrowError(`Could not find the attribute of the widget:

{}

Please check whether the widget's getWidgetRenderState returns widgetParams.attribute correctly.`);
  });

  it('does not read the attribute from a custom widget without widgetParams in getWidgetRenderState', () => {
    expect(() =>
      getWidgetAttribute({
        // @ts-expect-error testing invalid input
        getWidgetRenderState() {
          return { yo: true };
        },
      })
    ).toThrowError(`Could not find the attribute of the widget:

{}

Please check whether the widget's getWidgetRenderState returns widgetParams.attribute correctly.`);
  });

  it('does not read the attribute from a custom widget with nothing in getWidgetRenderState', () => {
    expect(() =>
      getWidgetAttribute({
        // @ts-expect-error testing invalid input
        getWidgetRenderState() {},
      })
    ).toThrowError(`Could not find the attribute of the widget:

{}

Please check whether the widget's getWidgetRenderState returns widgetParams.attribute correctly.`);
  });
});
