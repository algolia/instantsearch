export function getNumberOfResults() {
  return browser
    .getText('#stats')
    .then(text => parseInt(text.match(/(\d+) results/)[1], 10));
}

export function getCurrentRefinements() {
  return browser
    .element('#current-refined-values .item')
    .then(() => browser
      .getText('#current-refined-values .item')
      .then(res => Array.isArray(res) ? res : [res])
      .then(res => res.map(formatTextRefinement))
    )
    .catch(() => Promise.resolve([]));
}

export function clearAll() {
  // clear-all click seems tricky in some browsers
  return browser.click('#clear-all a').pause(500);
}

export const searchBox = {
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
//  return browser.getText(selector).then(formatTextRefinement);
// }

function formatTextRefinement(textRefinement) {
  let data = textRefinement.split('\n');

  // some browsers like IE will send a slighty different html
  // they send "Appliances 1543" instead of "Appliances \n1543"
  if (data.length === 1) {
    let countPosition = textRefinement.lastIndexOf(' ');
    data = [
      textRefinement.slice(0, countPosition),
      textRefinement.slice(-(textRefinement.length - countPosition))
    ];
  }

  const refinement = {
    name: data[0].trim()
  };

  if (data[1] !== undefined) {
    refinement.count = parseInt(data[1], 10);
  }

  return refinement;
}

