import createWidgetsManager from './createWidgetsManager';

describe('createWidgetsManager', () => {
  describe('registerWidget', () => {
    it('adds the widget to the widgets list', () => {
      const wm = createWidgetsManager(() => null);
      const widget = {};
      wm.registerWidget(widget);
      expect(wm.getWidgets()[0]).toBe(widget);
    });

    it('returns an unregister method', () => {
      const wm = createWidgetsManager(() => null);
      const unregister = wm.registerWidget({});
      unregister();
      expect(wm.getWidgets()).toHaveLength(0);
    });

    it('schedules an update', () => {
      const onUpdate = jest.fn();
      const wm = createWidgetsManager(onUpdate);
      wm.registerWidget({});
      return Promise.resolve().then(() => {
        expect(onUpdate.mock.calls).toHaveLength(1);
      });
    });
  });

  describe('update', () => {
    it('schedules an update', () => {
      const onUpdate = jest.fn();
      const wm = createWidgetsManager(onUpdate);
      wm.update();
      return Promise.resolve().then(() => {
        expect(onUpdate.mock.calls).toHaveLength(1);
      });
    });
  });
});
