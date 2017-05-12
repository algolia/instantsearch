import instantsearch from "../../../index.js";

window.instantsearch = instantsearch;
window.search = instantsearch({
  appId: "latency",
  apiKey: "6be0576ff61c053d5f9a3225e2a90f76",
  indexName: "instant_search",
  urlSync: false
});

export default function bindRunExamples(codeSamples) {
  codeSamples.forEach((codeSample, index) => {
    const state = { RUNNING: false };

    // container for code sample live example
    const liveExampleContainer = document.createElement("div");
    liveExampleContainer.id = `live-example-${index}`;
    liveExampleContainer.classList.add("live-example");

    const runExample = function() {
      if (!state.RUNNING) {
        state.RUNNING = true;

        // append widget container before running code
        codeSample.after(liveExampleContainer);

        // replace `container` option with the generated one
        const codeToEval = codeSample.lastChild.innerText.replace(
          /container: \S+,?/,
          `container: "#${liveExampleContainer.id}",`
        );

        // execute code, display widget
        window.eval(codeToEval);
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
