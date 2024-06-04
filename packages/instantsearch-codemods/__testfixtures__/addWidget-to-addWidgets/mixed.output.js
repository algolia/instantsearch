/* global instantsearch */

const search = instantsearch();

function someRandomFunction() {}
const unrelated = {
  function() {},
};

search.addWidgets([instantsearch.widgets.hits({})]);

someRandomFunction();
unrelated.function();

search.addWidgets([instantsearch.widgets.hits({})]);

search.addWidgets([instantsearch.widgets.hits({})]);

search.addWidgets([instantsearch.widgets.hits({})]);
