import cheerio from 'cheerio';

export function getNumberOfResults() {
  return browser
    .getText('#stats')
    .then(text => parseInt(text.match(/(\d+) results/)[1], 10));
}

export function getCurrentRefinements() {
  return browser
    .getHTML('#current-refined-values .facet-value > div')
    .then(formatRefinements)
    .catch(() => Promise.resolve([]));
}

export function clearAll() {
  // clear-all click seems tricky in some browsers
  return browser.click('#clear-all a').pause(500);
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
  }
};

// export function getRefinementFromSelector(selector) {
//  return browser.getText(selector).then(formatRefinements);
// }

function formatRefinements(refinementsAsHTML) {
  if (!Array.isArray(refinementsAsHTML)) {
    refinementsAsHTML = [refinementsAsHTML];
  }

  return refinementsAsHTML.map(refinementAsHTML => {
    // element is (simplified) <div>facetName <span>facetCount</span></div>
    const element = cheerio.parseHTML(refinementAsHTML)[0];

    // <div>**facetName** <span>facetCount</span></div>
    const name = element.firstChild.nodeValue.trim();

    // some widgets have no counts (pricesRanges)
    // <div>facetName <span>**facetCount**</span></div>
    const maybeCount = element.firstChild.nextSibling.children;

    return {
      name,

      count: maybeCount && maybeCount[0] && maybeCount[0].nodeValue !== undefined ?
        parseInt(maybeCount[0].nodeValue, 10) :
        'n/a'
    };
  });
}

