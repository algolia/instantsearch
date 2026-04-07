import { render } from "preact";
import { App } from "./App";

import "instantsearch.css/themes/nova.css";
import "./style.css";

render(<App />, document.getElementById("app")!);
