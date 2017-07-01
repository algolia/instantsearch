export function clearAll() {
  // clear-all click seems tricky in some browsers
  browser.click('#clear-all a');
  browser.pause(500);
}

export const searchBox = {
  selector: '#search-box',
  set(query) {
    return browser.setValue('#search-box', query);
  },
  clear() {
    return browser.clearElement('#search-box');
  },
  get() {
    return browser.getValue('#search-box');
  },
};

function blurAll() {
  if ('activeElement' in document) {
    document.activeElement.blur();
  }
}

export function prepareScreenshot() {
  // The focus bar visibility is flaky.
  return browser.execute(blurAll);
}
