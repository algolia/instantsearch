class Index {
  constructor({ name }) {
    this.helper = null;
    this.name = name;
    this.widgets = [];
  }

  addWidgets(widgets) {
    widgets.forEach(widget => {
      this.widgets.push(widget);
    });

    if (this.started) {
      // Do something in that case
    }

    return this;
  }

  render({ instantSearchInstance, helper, results, state }) {
    // if (!this.helper.hasPendingRequests()) {
    //   clearTimeout(this._searchStalledTimer);
    //   this._searchStalledTimer = null;
    //   this._isSearchStalled = false;
    // }

    this.widgets.forEach(widget => {
      widget.render({
        templatesConfig: instantSearchInstance.templatesConfig,
        results,
        state,
        helper,
        createURL: () => {},
        instantSearchInstance,
        searchMetadata: {
          isSearchStalled: instantSearchInstance._isSearchStalled,
        },
      });
    });
  }

  init({ instantSearchInstance, state, helper }) {
    this.widgets.forEach(widget => {
      widget.init({
        state,
        helper,
        templatesConfig: instantSearchInstance.templatesConfig,
        createURL: () => {},
        onHistoryChange: () => {},
        instantSearchInstance,
      });
    });
  }
}

export default Index;
