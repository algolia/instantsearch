/* global instantsearch */

const search = instantsearch();

function someRandomFunction() {}
const unrelated = {
  function() {},
};

search.addWidget(instantsearch.widgets.hits({}));

someRandomFunction();
unrelated.function();

search.addWidget(instantsearch.widgets.hits({}));

search.addWidgets([instantsearch.widgets.hits({})]);

search.addWidget(instantsearch.widgets.hits({}));
