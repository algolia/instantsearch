import instantsearch from "../../../index.js";
import capitalize from 'lodash/capitalize';

window.instantsearch = instantsearch;
window.search = instantsearch({
  appId: "latency",
  apiKey: "6be0576ff61c053d5f9a3225e2a90f76",
  indexName: "instant_search",
  urlSync: false,
  searchParameters: {
    hitsPerPage: 3
  }
});

const el = html => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div;
};

export default function bindRunExamples(codeSamples) {
  codeSamples.forEach((codeSample, index) => {
    if (codeSample.lastChild.innerText.indexOf('search.addWidget') !== 0) {
      return
    }

    const state = { RUNNING: false };

    const [, widgetName] = /widgets.(\S+)\(/g.exec(
      codeSample.lastChild.innerText
    );

    // container for code sample live example
    const liveExampleContainer = el(`
      <div class="live-example">
        <h3>${capitalize(widgetName)} widget example</h3>
        <div id="live-example-${index}"></div>

        <div class="live-example-helpers">
          <h3>SearchBox & Hits</h3>
          <div id="search-box-container-${index}"></div>
          <div id="hits-container-${index}"></div>
        </div>
      </div>
    `);

    const runExample = function() {
      if (!state.RUNNING) {
        state.RUNNING = true;

        // append widget container before running code
        codeSample.after(liveExampleContainer);

        // replace `container` option with the generated one
        const codeToEval = codeSample.lastChild.innerText.replace(
          /container: \S+,?/,
          `container: "#live-example-${index}",`
        );

        // execute code, display widget
        window.eval(codeToEval);

        // add default searchbox & hits
        search.addWidget(
          instantsearch.widgets.searchBox({
            container: `#search-box-container-${index}`,
            placeholder: "Search for products",
            autofocus: false
          })
        );

        search.addWidget(
          instantsearch.widgets.hits({
            container: `#hits-container-${index}`,
            templates: {
              empty: "No results",
              item: "<strong>Hit {{objectID}}</strong>: {{{_highlightResult.name.value}}}"
            }
          })
        );

        search.start();
      }
    };

    // button with `Run` label
    const runBtn = document.createElement("button");
    runBtn.textContent = "Run";
    runBtn.style.marginRight = "10px";
    runBtn.onclick = runExample;

    codeSample.firstChild.appendChild(runBtn);
  });
}
