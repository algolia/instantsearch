export function clearAll() {
  // clear-all click seems tricky in some browsers
  browser.click('#clear-all a');
  browser.pause(500);
}

export const searchBox = {
  selector: 'body #search-box',
  set(query) {
    return browser.setValue('body #search-box', query);
  },
  clear() {
    return browser.clearElement('body #search-box');
  },
  get() {
    return browser.getValue('body #search-box');
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
