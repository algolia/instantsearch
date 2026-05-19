import { render } from "preact";

import { App } from "./App";
import { postToParent } from "./utils/parentMessenger";

import "instantsearch.css/themes/nova.css";
import "./style.css";

render(<App />, document.getElementById("app")!);

// Post content height to the docs parent so the iframe can resize to fit
// (paired with iframe-resize.js in algolia/docs-new).
if (window.parent && window.parent !== window) {
  // No inner scrollbar needed; avoids a stray gutter on always-show-scrollbar OSes.
  document.documentElement.style.overflow = "hidden";

  // Lets stylesheets and components branch on the embedded state.
  document.body.classList.add("is-embedded");

  const postHeight = () => {
    // Measure body, not documentElement: documentElement.scrollHeight floors
    // to the viewport size and can't shrink.
    const height = Math.ceil(
      Math.max(
        document.body.scrollHeight,
        document.body.getBoundingClientRect().bottom,
      ),
    );
    if (!Number.isFinite(height) || height < 100 || height > 10000) return;
    postToParent({ type: "showcase-resize", height });
  };

  window.addEventListener("load", postHeight);
  new ResizeObserver(postHeight).observe(document.body);
}
