import { hitsPerPage as fn } from "instantsearch.js/es/widgets";

import { uppercaseLabels } from "../transforms";
import { defineWidget } from "../types";

export const hitsPerPage = defineWidget({
  name: "hitsPerPage",
  fn,
  slot: "toolbar",
  replaces: ["configure"],
  defaults: [
    {
      key: "items",
      label:
        "[\n    { label: '4 hits per page', value: 4, default: true },\n    { label: '8 hits per page', value: 8 },\n    { label: '12 hits per page', value: 12},\n  ]",
      value: {
        items: [
          { label: "4 hits per page", value: 4, default: true },
          { label: "8 hits per page", value: 8 },
          { label: "12 hits per page", value: 12 },
        ],
      },
    },
  ],
  toggles: [
    {
      key: "transformItems",
      label: "uppercaseLabels",
      value: { transformItems: uppercaseLabels },
    },
  ],
});
