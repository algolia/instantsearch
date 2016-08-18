export default function createWidgetsManager(onWidgetsUpdate) {
  const widgets = [];
  // Is an update scheduled?
  let scheduled = false;

  // The state manager's updates need to be batched since more than one
  // component can register or unregister widgets during the same tick.
  function scheduleUpdate() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    process.nextTick(() => {
      scheduled = false;
      onWidgetsUpdate();
    });
  }

  return {
    registerWidget(widget) {
      widgets.push(widget);
      scheduleUpdate();
      return function unregisterWidget() {
        widgets.splice(widgets.indexOf(widget), 1);
        scheduleUpdate();
      };
    },
    update() {
      scheduleUpdate();
    },

    getMetadata(widgetsState) {
      return widgets
        .filter(widget => widget.getMetadata !== null)
        .map(widget => widget.getMetadata(widgetsState));
    },
    getSearchParameters(searchParameters) {
      return widgets
        .filter(widget => widget.getSearchParameters !== null)
        .reduce(
          (res, widget) => {
            const prevPage = res.page;
            res = widget.getSearchParameters(res);
            // The helper's default behavior for most `set` methods is to reset
            // the current page to 0. We don't want that to happen here, since a
            // widget might have previously refined the `page` query parameter
            // and that refinement would be overriden.
            if (res.page === 0 && prevPage !== 0) {
              res = res.setPage(prevPage);
            }
            return res;
          },
          searchParameters
        );
    },
  };
}
