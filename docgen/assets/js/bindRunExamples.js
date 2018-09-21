import instantsearch from "../../../src/lib/main.js";
import algoliasearch from "algoliasearch/lite";
import capitalize from "lodash/capitalize";

window.instantsearch = instantsearch;
window.search = instantsearch({
  indexName: window.searchConfig.indexName || "instant_search",
  searchClient: algoliasearch(
    window.searchConfig.appId || "latency",
    window.searchConfig.apiKey || "6be0576ff61c053d5f9a3225e2a90f76"
  ),
  searchParameters: {
    hitsPerPage: 3,
  }
});

const el = html => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div;
};

function initWidgetExample(codeSample, index) {
  const state = { IS_RUNNING: false };

  const [, widgetName] = /widgets.(\S+)\(/g.exec(
    codeSample.lastChild.innerText
  );

  // container for code sample live example
  const liveExampleContainer = createLiveExampleContainer(
    widgetName,
    "widget",
    index
  );

  const runExample = function() {
    if (!state.IS_RUNNING) {
      state.IS_RUNNING = true;

      // append widget container before running code
      codeSample.after(liveExampleContainer);

      // replace `container` option with the generated one
      const codeToEval = codeSample.lastChild.innerText.replace(
        /container: \S+,?/,
        `container: "#live-example-${index}",`
      );

      // execute code, display widget
      window.eval(codeToEval);
      appendDefaultSearchWidgets(index);
    }
  };

  appendRunButton(codeSample, runExample);
}

function initConnectorExample(codeSample, index) {
  const state = { IS_RUNNING: false };

  const [, widgetName] = /the custom (\S+) widget/g.exec(
    codeSample.lastChild.innerText
  );

  const liveExampleContainer = createLiveExampleContainer(
    widgetName,
    "connector",
    index
  );

  const runExample = () => {
    if (!state.IS_RUNNING) {
      state.IS_RUNNING = true;

      codeSample.after(liveExampleContainer);

      const codeToEval = codeSample.lastChild.innerText.replace(
        /containerNode: \S+,?/,
        `containerNode: $("#live-example-${index}"),`
      );

      window.eval(codeToEval);
      appendDefaultSearchWidgets(index);
    }
  };

  appendRunButton(codeSample, runExample);
}

function createLiveExampleContainer(name, type, index) {
  return el(`
    <div class="live-example">
      <h3>${capitalize(name)} ${type} example</h3>
      <div id="live-example-${index}"></div>

      <div class="live-example-helpers">
        <h3>SearchBox & Hits</h3>
        <div id="search-box-container-${index}"></div>
        <div id="hits-container-${index}"></div>
      </div>
    </div>
  `);
}

function appendDefaultSearchWidgets(index) {
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

function appendRunButton(codeSample, handler) {
  const runBtn = document.createElement("button");
  runBtn.textContent = "Run";
  runBtn.style.marginRight = "10px";
  runBtn.onclick = handler;

  codeSample.previousSibling.appendChild(runBtn);
}

export default function bindRunExamples(codeSamples) {
  codeSamples.forEach((codeSample, index) => {
    const exampleContent = codeSample.lastChild.innerText;

    // initialize examples for widget
    if (exampleContent.indexOf("search.addWidget") === 0) {
      initWidgetExample(codeSample, index);
    }

    // initialize examples for connector, check we have the matching pattern
    if (/function renderFn\(\S+(, isFirstRendering)?\) {/g.test(exampleContent)) {
      initConnectorExample(codeSample, index);
    }
  });
}
